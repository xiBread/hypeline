use std::collections::HashMap;

use futures::future::try_join_all;
use futures::{SinkExt, StreamExt};
use serde_json::json;
use tokio::sync::mpsc;
use tokio_tungstenite::connect_async;
use tokio_tungstenite::tungstenite::Message;
use twitch_api::eventsub::EventSubSubscription;
use twitch_api::twitch_oauth2::{TwitchToken, UserToken};
use twitch_api::HelixClient;

use crate::api::Response;
use crate::error::Error;
use crate::HTTP;

const TWITCH_EVENTSUB_WS_URI: &str = "wss://eventsub.wss.twitch.tv/ws";

#[derive(Clone)]
pub struct EventSubClient<'a> {
    helix: &'a HelixClient<'static, reqwest::Client>,
    token: &'a UserToken,
    session_id: Option<String>,
    subscriptions: HashMap<String, String>,
}

impl<'a> EventSubClient<'a> {
    pub fn new(
        helix: &'a HelixClient<'static, reqwest::Client>,
        token: &'a UserToken,
    ) -> (mpsc::UnboundedReceiver<()>, Self) {
        let (sender, receiver) = mpsc::unbounded_channel::<()>();

        (
            receiver,
            Self {
                helix,
                token,
                session_id: None,
                subscriptions: HashMap::new(),
            },
        )
    }

    pub async fn connect(self) {
        let (mut stream, _) = connect_async(TWITCH_EVENTSUB_WS_URI).await.unwrap();

        tokio::spawn(async move {
            while let Some(Ok(message)) = stream.next().await {
                match message {
                    Message::Ping(data) => {
                        stream.send(Message::Pong(data)).await;
                    }
                    Message::Text(data) => {}
                    Message::Close(frame) => {}
                    _ => (),
                }
            }
        });
    }

    pub async fn subscribe(
        mut self,
        event: String,
        condition: serde_json::Value,
    ) -> Result<(), Error> {
        let body = json!({
            "type": event,
            "version": "1",
            "condition": condition,
            "transport": {
                "method": "websocket",
                "session_id": self.session_id,
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

        self.subscriptions.insert(event, response.data.0.id.take());

        Ok(())
    }

    pub async fn subscribe_all(
        self,
        subscriptions: &[(&str, &serde_json::Value)],
    ) -> Result<(), Error> {
        let futures = subscriptions
            .iter()
            .map(|&(event, condition)| self.clone().subscribe(event.into(), condition.clone()));

        try_join_all(futures).await?;

        Ok(())
    }

    pub async fn unsubscribe(mut self, event: String) -> Result<(), Error> {
        let id = self.subscriptions.remove(&event);

        if let Some(id) = id {
            self.helix
                .delete_eventsub_subscription(id, self.token)
                .await?;
        }

        Ok(())
    }

    pub async fn unsubscribe_all(self) -> Result<(), Error> {
        let futures = self
            .subscriptions
            .keys()
            .map(|event| self.clone().unsubscribe(event.into()));

        try_join_all(futures).await?;

        Ok(())
    }
}
