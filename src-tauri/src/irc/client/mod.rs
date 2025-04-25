pub(crate) mod event_loop;
mod pool_connection;

use event_loop::{ClientLoopCommand, ClientLoopWorker};
use std::sync::Arc;
use tokio::sync::{mpsc, oneshot};

use crate::irc;

use super::message::{IrcMessage, IrcTags, ServerMessage};
use super::{ClientConfig, Error};

#[derive(Debug, Clone)]
pub struct IrcClient {
    client_loop_tx: Arc<mpsc::UnboundedSender<ClientLoopCommand>>,
}

impl IrcClient {
    pub fn new(config: ClientConfig) -> (mpsc::UnboundedReceiver<ServerMessage>, IrcClient) {
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

        (client_incoming_messages_rx, IrcClient { client_loop_tx })
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

    pub async fn send(&self, channel_login: String, message: String) -> Result<(), Error> {
        self.send_message(irc![
            "PRIVMSG",
            format!("#{}", channel_login),
            format!(". {}", message)
        ])
        .await
    }

    pub async fn me(&self, channel_login: String, message: String) -> Result<(), Error> {
        self.send_message(irc![
            "PRIVMSG",
            format!("#{}", channel_login),
            format!("/me {}", message)
        ])
        .await
    }

    pub async fn reply(
        &self,
        channel_login: String,
        message_id: String,
        message: String,
        me: bool,
    ) -> Result<(), Error> {
        let mut tags = IrcTags::new();

        tags.0.insert("reply-parent-msg-id".to_owned(), message_id);

        let irc_message = IrcMessage::new(
            tags,
            None,
            "PRIVMSG".to_owned(),
            vec![
                format!("#{}", channel_login),
                format!("{} {}", if me { "/me" } else { "." }, message),
            ],
        );

        self.send_message(irc_message).await
    }

    pub fn join(&self, channel_login: String) {
        self.client_loop_tx
            .send(ClientLoopCommand::Join { channel_login })
            .unwrap();
    }

    pub async fn get_channel_status(&self, channel_login: String) -> (bool, bool) {
        let (return_tx, return_rx) = oneshot::channel();
        self.client_loop_tx
            .send(ClientLoopCommand::GetChannelStatus {
                channel_login,
                return_sender: return_tx,
            })
            .unwrap();

        return_rx.await.unwrap()
    }

    pub fn part(&self, channel_login: String) {
        self.client_loop_tx
            .send(ClientLoopCommand::Part { channel_login })
            .unwrap();
    }
}
