use serde_json::json;
use tauri::async_runtime::Mutex;
use tauri::State;
use twitch_api::eventsub::EventSubSubscription;
use twitch_api::twitch_oauth2::TwitchToken;

use crate::error::Error;
use crate::AppState;

use super::{get_access_token, Response};

#[tauri::command]
pub async fn subscribe(
    state: State<'_, Mutex<AppState>>,
    session_id: String,
    event: String,
    condition: serde_json::Value,
) -> Result<(), Error> {
    let mut state = state.lock().await;
    let token = get_access_token(&state).await?;

    let body = json!({
        "type": event,
        "version": "1",
        "condition": condition,
        "transport": {
            "method": "websocket",
            "session_id": session_id,
        }
    });

    let response: Response<(EventSubSubscription,)> = state
        .http
        .post("https://api.twitch.tv/helix/eventsub/subscriptions")
        .bearer_auth(token.access_token.as_str())
        .header("Client-Id", token.client_id().as_str())
        .json(&body)
        .send()
        .await?
        .json()
        .await?;

    state.subscriptions.insert(event, response.data.0.id.take());

    Ok(())
}

#[tauri::command]
pub async fn unsubscribe(state: State<'_, Mutex<AppState>>, event: String) -> Result<(), Error> {
    let id = {
        let mut state = state.lock().await;
        state.subscriptions.remove(&event)
    };

    let state = state.lock().await;
    let token = get_access_token(&state).await?;

    match id {
        Some(id) => {
            state
                .http
                .delete("https://api.twitch.tv/helix/eventsub/subscriptions")
                .query(&[("id", id)])
                .bearer_auth(token.access_token.as_str())
                .header("Client-Id", token.client_id().as_str())
                .send()
                .await?;

            Ok(())
        }
        None => Ok(()),
    }
}
