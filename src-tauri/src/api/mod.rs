use anyhow::anyhow;
use serde::{Deserialize, Serialize};
use tauri::State;
use tauri::async_runtime::Mutex;
use twitch_api::twitch_oauth2::{AccessToken, UserToken};

use crate::AppState;
use crate::error::Error;

pub mod channels;
pub mod chat;
pub mod moderation;
pub mod users;

#[derive(Debug, Deserialize)]
pub struct Response<T> {
    pub data: T,
}

pub fn get_access_token(state: &AppState) -> Result<&UserToken, Error> {
    state.token.as_ref().ok_or_else(|| {
        tracing::error!("Attempted to retrieve access token but no token is set");
        Error::Generic(anyhow!("Access token not set"))
    })
}

#[derive(Clone, Serialize)]
pub struct TokenInfo {
    user_id: String,
    access_token: String,
}

pub async fn set_access_token(
    state: State<'_, Mutex<AppState>>,
    token: String,
) -> Option<TokenInfo> {
    let mut state = state.lock().await;

    state.token = UserToken::from_token(&state.helix, AccessToken::from(token))
        .await
        .ok();

    if let Some(ref token) = state.token {
        let raw_token = token.access_token.as_str();
        tracing::debug!("Set access token to {}", raw_token);

        Some(TokenInfo {
            user_id: token.user_id.to_string(),
            access_token: raw_token.to_string(),
        })
    } else {
        None
    }
}
