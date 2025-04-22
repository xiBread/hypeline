use futures::future::try_join_all;
use serde_json::json;
use tauri::async_runtime::Mutex;
use tauri::State;
use twitch_api::eventsub::EventSubSubscription;
use twitch_api::twitch_oauth2::TwitchToken;

use crate::error::Error;
use crate::{AppState, HTTP};

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

    let response: Response<(EventSubSubscription,)> = HTTP
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

pub async fn subscribe_all(
    state: State<'_, Mutex<AppState>>,
    session_id: String,
    subscriptions: &[(&str, &serde_json::Value)],
) -> Result<(), Error> {
    let futures = subscriptions.iter().map(|&(event, condition)| {
        subscribe(
            state.clone(),
            session_id.clone(),
            event.into(),
            condition.clone(),
        )
    });

    try_join_all(futures).await?;

    Ok(())
}

#[tauri::command]
pub async fn unsubscribe(state: State<'_, Mutex<AppState>>, event: String) -> Result<(), Error> {
    let mut state = state.lock().await;

    let id = state.subscriptions.remove(&event);
    let token = get_access_token(&state).await?;

    match id {
        Some(id) => {
            HTTP.delete("https://api.twitch.tv/helix/eventsub/subscriptions")
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

#[tauri::command]
pub async fn unsubscribe_all(
    state: State<'_, Mutex<AppState>>,
    events: &[&str],
) -> Result<(), Error> {
    let futures = events
        .iter()
        .map(|&event| unsubscribe(state.clone(), event.into()));

    try_join_all(futures).await?;

    Ok(())
}
