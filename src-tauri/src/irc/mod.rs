// Local copy of https://github.com/robotty/twitch-irc-rs since there are some
// missing features and extra things not needed. Might move to a seperate repo
// later.

pub mod client;
mod config;
mod connection;
mod error;
pub mod message;
pub mod websocket;

pub use client::IrcClient;
use config::ClientConfig;
use error::Error;
use message::ServerMessage;
use tauri::ipc::Channel;
use tauri::{async_runtime, State};
use tokio::sync::Mutex;
use tracing::Instrument;

use crate::api::get_access_token;
use crate::error::Error as AppError;
use crate::AppState;

#[tracing::instrument(skip_all)]
#[tauri::command]
pub async fn connect_irc(
    state: State<'_, Mutex<AppState>>,
    channel: Channel<ServerMessage>,
) -> Result<(), AppError> {
    let mut guard = state.lock().await;
    let token = get_access_token(&guard)?;
    let login = token.login.to_string();

    let config = ClientConfig::new(
        login.clone(),
        // Need to convert to &str first because AccessToken::to_string masks
        // the actual token
        token.access_token.as_str().to_string(),
    );

    let (mut incoming, client) = IrcClient::new(config);

    async_runtime::spawn(
        async move {
            while let Some(message) = incoming.recv().await {
                tracing::trace!(?message, "Received {} message", message.source().command);

                match message {
                    ServerMessage::Join(ref join) => {
                        tracing::info!("Joined {}", join.channel_login);
                    }
                    ServerMessage::Part(ref part) => {
                        tracing::info!("Parted {}", part.channel_login);
                    }
                    _ => (),
                }

                channel.send(message).unwrap();
            }
        }
        .in_current_span(),
    );

    client.connect().await;
    guard.irc = Some(client);

    Ok(())
}
