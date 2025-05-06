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

pub async fn get_access_token<'a>(state: &'a AppState) -> Result<&'a UserToken, Error> {
    state
        .token
        .as_ref()
        .ok_or_else(|| Error::Generic(anyhow!("Access token not set")))
}

pub async fn set_access_token(state: State<'_, Mutex<AppState>>, token: String) {
    let mut state = state.lock().await;

    state.token = UserToken::from_token(&state.helix, AccessToken::from(token))
        .await
        .ok();
}
