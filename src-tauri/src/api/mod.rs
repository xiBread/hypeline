use anyhow::anyhow;
use serde::Deserialize;
use tauri::async_runtime::Mutex;
use tauri::State;
use twitch_api::twitch_oauth2::{AccessToken, UserToken};

use crate::error::Error;
use crate::AppState;

pub mod channels;
pub mod chat;
pub mod moderation;
pub mod users;

#[derive(Debug, Deserialize)]
pub struct Response<T> {
    pub data: T,
}

pub fn get_access_token<'a>(state: &'a AppState) -> Result<&'a UserToken, Error> {
    state.token.as_ref().ok_or_else(|| {
        tracing::error!("Attempted to retrieve access token but no token is set");
        Error::Generic(anyhow!("Access token not set"))
    })
}

pub async fn set_access_token(state: State<'_, Mutex<AppState>>, token: String) {
    let mut state = state.lock().await;

    state.token = UserToken::from_token(&state.helix, AccessToken::from(token))
        .await
        .ok();

    if let Some(ref token) = state.token {
        tracing::debug!("Set access token to {}", token.access_token.as_str());
    }
}
