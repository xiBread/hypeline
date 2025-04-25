use anyhow::anyhow;
use tauri::async_runtime::{self, Mutex};
use tauri::ipc::Channel;
use tauri::State;
use twitch_api::twitch_oauth2::{AccessToken, UserToken};

use crate::error::Error;
use crate::irc::message::ServerMessage;
use crate::irc::{ClientConfig, IrcClient};
use crate::AppState;

pub mod channels;
pub mod chat;
pub mod moderation;
pub mod users;

pub async fn get_access_token<'a>(state: &'a AppState) -> Result<&'a UserToken, Error> {
    state
        .token
        .as_ref()
        .ok_or_else(|| Error::Generic(anyhow!("Access token not set")))
}

#[tauri::command]
pub async fn set_access_token(state: State<'_, Mutex<AppState>>, token: String) -> Result<(), ()> {
    let mut state = state.lock().await;

    state.token = UserToken::from_token(&state.helix, AccessToken::from(token))
        .await
        .ok();

    Ok(())
}

#[tauri::command]
pub async fn connect(
    state: State<'_, Mutex<AppState>>,
    channel: Channel<ServerMessage>,
) -> Result<(), Error> {
    let mut guard = state.lock().await;
    let token = get_access_token(&guard).await?;
    let login = token.login.to_string();

    let config = ClientConfig::new(
        login.clone(),
        // Need to convert to &str first because AccessToken::to_string masks
        // the actual token
        token.access_token.as_str().to_string(),
    );

    let (mut incoming, client) = IrcClient::new(config);

    async_runtime::spawn(async move {
        while let Some(message) = incoming.recv().await {
            // println!("{:#?}", message.source());
            channel.send(message).unwrap();
        }
    });

    client.connect().await;
    guard.irc = Some(client);

    Ok(())
}
