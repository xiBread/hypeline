use std::collections::HashMap;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;

use anyhow::anyhow;
use futures::future::join_all;
use futures::{SinkExt, StreamExt};
use serde::de::{DeserializeOwned, Error as DeError};
use serde::{Deserialize, Deserializer, Serialize};
use serde_json::json;
use tokio::sync::{mpsc, Mutex};
use tokio_tungstenite::connect_async;
use tokio_tungstenite::tungstenite::Message;
use twitch_api::eventsub::{EventSubSubscription, EventType};
use twitch_api::twitch_oauth2::{TwitchToken, UserToken};
use twitch_api::HelixClient;

use crate::api::Response;
use crate::error::Error;
use crate::HTTP;

const TWITCH_EVENTSUB_WS_URI: &str = "wss://eventsub.wss.twitch.tv/ws";

const V2_EVENTS: [EventType; 4] = [
    EventType::AutomodMessageHold,
    EventType::AutomodMessageUpdate,
    EventType::ChannelModerate,
    EventType::ChannelPointsAutomaticRewardRedemptionAdd,
];

#[derive(Debug, Deserialize)]
enum MessageType {
    #[serde(rename = "session_welcome")]
    Welcome,
    #[serde(rename = "notification")]
    Notification,
    #[serde(rename = "session_reconnect")]
    Reconnect,
    #[serde(rename = "revocation")]
    Revocation,
    #[serde(rename = "session_keepalive")]
    Keepalive,
}

#[derive(Debug, Deserialize)]
pub struct MessageMetadata {
    message_type: MessageType,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Subscription {
    pub id: String,
    #[serde(rename(serialize = "type"))]
    kind: EventType,
}

#[derive(Debug, Deserialize)]
pub struct WebSocketSession {
    id: String,
    reconnect_url: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct SessionPayload {
    session: WebSocketSession,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct NotificationPayload {
    subscription: Subscription,
    event: serde_json::Value,
}

#[derive(Debug, Deserialize)]
pub struct RevocationPayload {
    pub subscription: Subscription,
}

#[derive(Debug)]
pub enum WebSocketMessage {
    Welcome(SessionPayload),
    Notification(NotificationPayload),
    Reconnect(SessionPayload),
    Revocation(RevocationPayload),
    Keepalive,
}

#[derive(Deserialize)]
struct MessageDeserializer {
    metadata: MessageMetadata,
    payload: Option<serde_json::Value>,
}

fn parse_payload<T, E>(payload: serde_json::Value) -> Result<T, E>
where
    T: DeserializeOwned,
    E: DeError,
{
    T::deserialize(payload).map_err(DeError::custom)
}

impl<'de> Deserialize<'de> for WebSocketMessage {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'de>,
    {
        let message = MessageDeserializer::deserialize(deserializer)?;
        let payload = message.payload.unwrap_or(serde_json::Value::Null);

        match message.metadata.message_type {
            MessageType::Welcome => Ok(Self::Welcome(parse_payload(payload)?)),
            MessageType::Keepalive => Ok(Self::Keepalive),
            MessageType::Notification => Ok(Self::Notification(parse_payload(payload)?)),
            MessageType::Reconnect => Ok(Self::Reconnect(parse_payload(payload)?)),
            MessageType::Revocation => Ok(Self::Revocation(parse_payload(payload)?)),
        }
    }
}

pub struct EventSubClient {
    helix: Arc<HelixClient<'static, reqwest::Client>>,
    pub token: Arc<UserToken>,
    session_id: Arc<Mutex<Option<String>>>,
    subscriptions: Arc<Mutex<HashMap<String, String>>>,
    sender: mpsc::UnboundedSender<NotificationPayload>,
    connected: AtomicBool,
    reconnecting: AtomicBool,
}

impl EventSubClient {
    pub fn new(
        helix: Arc<HelixClient<'static, reqwest::Client>>,
        token: Arc<UserToken>,
    ) -> (mpsc::UnboundedReceiver<NotificationPayload>, Self) {
        let (sender, receiver) = mpsc::unbounded_channel::<NotificationPayload>();

        let client = Self {
            helix,
            token,
            session_id: Arc::new(Mutex::new(None)),
            subscriptions: Arc::new(Mutex::new(HashMap::new())),
            sender,
            connected: AtomicBool::default(),
            reconnecting: AtomicBool::default(),
        };

        (receiver, client)
    }

    pub async fn connect(self: Arc<Self>) -> Result<(), Error> {
        let this = Arc::clone(&self);

        tokio::spawn(async move {
            let mut ws_uri = TWITCH_EVENTSUB_WS_URI.to_string();

            loop {
                let mut stream = match connect_async(&ws_uri).await {
                    Ok((stream, _)) => stream,
                    Err(e) => return Err::<(), _>(Error::WebSocket(e)),
                };

                self.set_connected(false);
                *self.session_id.lock().await = None;

                let mut reconnect_url: Option<String> = None;

                while let Some(Ok(message)) = stream.next().await {
                    let this = Arc::clone(&this);

                    match message {
                        Message::Ping(data) => {
                            stream.send(Message::Pong(data)).await?;
                        }
                        Message::Text(data) => {
                            if let Ok(msg) = serde_json::from_str(data.as_str()) {
                                match this.handle_message(msg).await? {
                                    Some(url) => {
                                        reconnect_url = Some(url);
                                        break;
                                    }
                                    None => continue,
                                }
                            }
                        }
                        Message::Close(_) => {
                            break;
                        }
                        _ => (),
                    }
                }

                self.set_connected(false);
                *self.session_id.lock().await = None;

                if let Some(url) = reconnect_url {
                    ws_uri = url;
                }
            }
        });

        Ok(())
    }

    async fn handle_message(
        self: Arc<Self>,
        msg: WebSocketMessage,
    ) -> Result<Option<String>, Error> {
        use WebSocketMessage as Ws;

        match msg {
            Ws::Welcome(payload) => {
                *self.session_id.lock().await = Some(payload.session.id);

                if self.reconnecting.load(Ordering::Relaxed) {
                    self.reconnecting.store(false, Ordering::Relaxed);
                } else {
                    self.subscribe(
                        EventType::UserUpdate,
                        json!({ "user_id": self.token.user_id }),
                    )
                    .await?;
                }
            }
            Ws::Notification(payload) => {
                self.sender.send(payload).unwrap();
            }
            Ws::Reconnect(payload) => {
                let url = payload
                    .session
                    .reconnect_url
                    .expect("missing reconnect_url in reconnect payload");

                self.reconnecting.store(true, Ordering::Relaxed);

                return Ok(Some(url));
            }
            Ws::Revocation(payload) => {
                self.subscriptions
                    .lock()
                    .await
                    .remove(&payload.subscription.kind.to_string());
            }
            _ => (),
        }

        Ok(None)
    }

    pub fn connected(&self) -> bool {
        self.connected.load(Ordering::Relaxed)
    }

    pub fn set_connected(&self, value: bool) {
        self.connected.store(value, Ordering::Relaxed);
    }

    pub async fn subscribe(
        &self,
        event: EventType,
        condition: serde_json::Value,
    ) -> Result<(), Error> {
        let session_id = self.session_id.lock().await;

        let Some(session_id) = session_id.as_ref() else {
            return Err(Error::Generic(anyhow!("No EventSub connection")));
        };

        let version = if V2_EVENTS.contains(&event) { "2" } else { "1" };

        let body = json!({
            "type": event,
            "version": version,
            "condition": condition,
            "transport": {
                "method": "websocket",
                "session_id": session_id,
            }
        });

        let response: Response<(EventSubSubscription,)> = HTTP
            .post("https://api.twitch.tv/helix/eventsub/subscriptions")
            .bearer_auth(self.token.access_token.as_str())
            .header("Client-Id", self.token.client_id().as_str())
            .json(&body)
            .send()
            .await?
            .json()
            .await?;

        self.subscriptions
            .lock()
            .await
            .insert(event.to_string(), response.data.0.id.take());

        Ok(())
    }

    pub async fn subscribe_all(
        &self,
        subscriptions: &[(EventType, &serde_json::Value)],
    ) -> Result<(), Error> {
        let futures = subscriptions
            .iter()
            .map(|&(event, condition)| self.subscribe(event, condition.clone()));

        join_all(futures).await;

        Ok(())
    }

    pub async fn unsubscribe(&self, event: String) -> Result<(), Error> {
        let id = self.subscriptions.lock().await.remove(&event);

        if let Some(id) = id {
            self.helix
                .delete_eventsub_subscription(id, &*self.token)
                .await?;
        }

        Ok(())
    }

    pub async fn unsubscribe_all(&self) -> Result<(), Error> {
        let keys = {
            let subscriptions = self.subscriptions.lock().await;

            subscriptions.keys().cloned().collect::<Vec<_>>()
        };

        let futures = keys.iter().map(|event| self.unsubscribe(event.into()));

        join_all(futures).await;

        Ok(())
    }
}
