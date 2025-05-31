pub(crate) mod event_loop;
mod pool_connection;

use std::sync::Arc;

use event_loop::{ClientLoopCommand, ClientLoopWorker};
use tokio::sync::{mpsc, oneshot};

use super::message::ServerMessage;
use super::ClientConfig;
use crate::irc::error::Error;
use crate::irc::message::{IrcMessage, IrcTags};

#[derive(Debug, Clone)]
pub struct IrcClient {
    client_loop_tx: Arc<mpsc::UnboundedSender<ClientLoopCommand>>,
}

impl IrcClient {
    pub fn new(config: ClientConfig) -> (mpsc::UnboundedReceiver<ServerMessage>, Self) {
        let config = Arc::new(config);
        let (client_loop_tx, client_loop_rx) = mpsc::unbounded_channel();

        let client_loop_tx = Arc::new(client_loop_tx);
        let (client_incoming_messages_tx, client_incoming_messages_rx) = mpsc::unbounded_channel();

        ClientLoopWorker::spawn(
            config,
            Arc::downgrade(&client_loop_tx),
            client_loop_rx,
            client_incoming_messages_tx,
        );

        (client_incoming_messages_rx, Self { client_loop_tx })
    }
}

impl IrcClient {
    pub async fn connect(&self) {
        let (return_tx, return_rx) = oneshot::channel();

        self.client_loop_tx
            .send(ClientLoopCommand::Connect {
                return_sender: return_tx,
            })
            .unwrap();

        return_rx.await.unwrap()
    }

    pub fn join(&self, channel_login: String) {
        self.client_loop_tx
            .send(ClientLoopCommand::Join { channel_login })
            .unwrap();
    }

    pub fn part(&self, channel_login: String) {
        self.client_loop_tx
            .send(ClientLoopCommand::Part { channel_login })
            .unwrap();
    }

    pub async fn send_message(&self, message: IrcMessage) -> Result<(), Error> {
        let (sender, receiver) = oneshot::channel();

        self.client_loop_tx
            .send(ClientLoopCommand::SendMessage {
                message,
                return_sender: sender,
            })
            .unwrap();

        receiver.await.unwrap()
    }

    pub async fn send(
        &self,
        channel: &str,
        message: String,
        reply_id: Option<String>,
    ) -> Result<(), Error> {
        let mut tags = IrcTags::new();

        if let Some(reply_id) = reply_id {
            tags.0.insert("reply-parent-message-id".into(), reply_id);
        }

        let is_action = message.starts_with("/me");

        let irc_msg = IrcMessage::new(
            tags,
            None,
            "PRIVMSG".into(),
            vec![
                format!("#{channel}"),
                format!(
                    "{} {}",
                    if is_action { "/me" } else { "." },
                    if is_action {
                        message.trim_start_matches("/me")
                    } else {
                        &message
                    }
                ),
            ],
        );

        self.send_message(irc_msg).await
    }
}
