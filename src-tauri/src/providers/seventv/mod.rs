pub mod client;
mod emotes;

use std::sync::Arc;

use anyhow::anyhow;
pub use client::SeventTvClient;
pub use emotes::*;
use serde_json::json;
use tauri::ipc::Channel;
use tauri::{async_runtime, AppHandle, Manager, State};
use tokio::sync::Mutex;

use crate::error::Error;
use crate::{AppState, HTTP};

#[tauri::command]
pub async fn connect_seventv(
    app_handle: AppHandle,
    state: State<'_, Mutex<AppState>>,
    channel: Channel<serde_json::Value>,
) -> Result<(), Error> {
    let mut state = state.lock().await;

    if let Some(client) = &state.seventv {
        if client.connected() {
            return Ok(());
        }
    }

    let (mut incoming, client) = SeventTvClient::new();
    let client = Arc::new(client);

    state.seventv = Some(client.clone());
    drop(state);

    async_runtime::spawn(async move {
        if client.clone().connect().await.is_err() {
            let state = app_handle.state::<Mutex<AppState>>();
            let mut state = state.lock().await;

            state.seventv = None;
        };
    });

    async_runtime::spawn(async move {
        while let Some(message) = incoming.recv().await {
            channel.send(message).unwrap();
        }
    });

    Ok(())
}

#[tracing::instrument(skip(state))]
#[tauri::command]
pub async fn send_presence(
    state: State<'_, Mutex<AppState>>,
    channel_id: String,
) -> Result<(), Error> {
    tracing::debug!("Sending presence");

    let state = state.lock().await;

    let Some(ref id) = state.seventv_id else {
        tracing::error!("Missing 7TV user id");
        return Err(Error::Generic(anyhow!("7TV id not set")));
    };

    let response = HTTP
        .post(format!("https://7tv.io/v3/users/{id}/presences"))
        .json(&json!({
            "kind": 1,
            "passive": false,
            "session_id": serde_json::Value::Null,
            "data": {
                "platform": "TWITCH",
                "id": channel_id
            }
        }))
        .send()
        .await;

    match response {
        Ok(resp) => {
            if resp.status().is_success() {
                tracing::debug!("Presence sent");
            } else {
                tracing::error!(
                    "Failed to send presence: {} {}",
                    resp.status(),
                    resp.text().await.unwrap_or_default()
                );
            }
        }
        Err(err) => {
            tracing::error!(%err, "Error sending presence");
        }
    }

    Ok(())
}
