use std::collections::HashMap;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;

use anyhow::anyhow;
use futures::{SinkExt, StreamExt};
use serde::Deserialize;
use serde_json::json;
use tokio::sync::{mpsc, Mutex};
use tokio_tungstenite::connect_async;
use tokio_tungstenite::tungstenite::Message;

use crate::error::Error;

const SEVENTV_WS_URI: &str = "wss://events.7tv.io/v3";

#[derive(Deserialize)]
struct WebSocketMessage {
    op: u8,
    d: serde_json::Value,
}

pub struct SeventTvClient {
    subscriptions: Arc<Mutex<HashMap<String, serde_json::Value>>>,
    sender: mpsc::UnboundedSender<serde_json::Value>,
    connected: AtomicBool,
    message_tx: mpsc::UnboundedSender<Message>,
    message_rx: Arc<Mutex<Option<mpsc::UnboundedReceiver<Message>>>>,
}

impl SeventTvClient {
    pub fn new() -> (mpsc::UnboundedReceiver<serde_json::Value>, Self) {
        let (sender, receiver) = mpsc::unbounded_channel::<serde_json::Value>();
        let (message_tx, message_rx) = mpsc::unbounded_channel();

        let client = Self {
            subscriptions: Arc::new(Mutex::new(HashMap::new())),
            sender,
            connected: AtomicBool::default(),
            message_tx,
            message_rx: Arc::new(Mutex::new(Some(message_rx))),
        };

        (receiver, client)
    }

    pub async fn connect(self: Arc<Self>) -> Result<(), Error> {
        let this = Arc::clone(&self);

        let mut message_rx = {
            let mut guard = this.message_rx.lock().await;

            guard
                .take()
                .ok_or_else(|| Error::Generic(anyhow!("Message receiver already taken")))?
        };

        tokio::spawn(async move {
            loop {
                let mut stream = match connect_async(SEVENTV_WS_URI).await {
                    Ok((stream, _)) => stream,
                    Err(e) => return Err::<(), _>(Error::WebSocket(e)),
                };

                self.connected.store(true, Ordering::Relaxed);

                'recv: loop {
                    let this = Arc::clone(&this);

                    tokio::select! {
                        Some(data) = message_rx.recv() => {
                            if let Err(e) = stream.send(data).await {
                                eprintln!("Error sending message: {e}");
                                break 'recv;
                            }
                        }
                        Some(Ok(message)) = stream.next() => {
                            match message {
                                Message::Text(text) => {
                                    if let Ok(msg) = serde_json::from_str::<WebSocketMessage>(&text) {
                                        if msg.op == 0 {
                                            this.sender.send(msg.d).unwrap();
                                        }
                                    }
                                }
                                Message::Close(_) => {
                                    this.connected.store(false, Ordering::Relaxed);
                                    break 'recv;
                                }
                                _ => (),
                            }
                        }
                    }
                }
            }
        });

        Ok(())
    }

    pub fn connected(&self) -> bool {
        self.connected.load(Ordering::Relaxed)
    }

    pub async fn subscribe(&self, event: &str, condition: &serde_json::Value) {
        let payload = json!({
            "op": 35,
            "d": {
                "type": event,
                "condition": condition
            }
        });

        if self
            .message_tx
            .send(Message::Text(payload.to_string().into()))
            .is_ok()
        {
            let mut subscriptions = self.subscriptions.lock().await;
            subscriptions.insert(event.to_string(), condition.clone());
        }
    }

    pub async fn unsubscribe(&self) {
        let mut subscriptions = self.subscriptions.lock().await;

        for (event, condition) in subscriptions.drain() {
            let payload = json!({
                "op": 36,
                "d": {
                    "type": event,
                    "condition": condition
                }
            });

            let _ = self
                .message_tx
                .send(Message::Text(payload.to_string().into()));
        }
    }
}
