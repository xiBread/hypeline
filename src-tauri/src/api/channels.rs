use futures::TryStreamExt;
use tauri::async_runtime::Mutex;
use tauri::State;
use twitch_api::helix::channels::FollowedBroadcaster;
use twitch_api::helix::chat::Chatter;
use twitch_api::helix::streams::Stream;

use crate::error::Error;
use crate::AppState;

use super::get_access_token;

#[tauri::command]
pub async fn get_chatters(
    state: State<'_, Mutex<AppState>>,
    id: String,
) -> Result<Vec<Chatter>, Error> {
    let state = state.lock().await;
    let token = get_access_token(&state).await?;

    let response = state
        .helix
        .get_chatters(&id, &token.user_id, 1000, token)
        .try_collect()
        .await;

    match response {
        Ok(chatters) => Ok(chatters),
        Err(_) => Ok(vec![]),
    }
}

#[tauri::command]
pub async fn get_stream(
    state: State<'_, Mutex<AppState>>,
    id: String,
) -> Result<Option<Stream>, Error> {
    let state = state.lock().await;
    let token = get_access_token(&state).await?;

    let mut streams: Vec<Stream> = state
        .helix
        .get_streams_from_ids(&[&id][..].into(), token)
        .try_collect()
        .await?;

    let stream = if streams.is_empty() {
        None
    } else {
        streams.pop()
    };

    Ok(stream)
}

#[tauri::command]
pub async fn get_followed(
    state: State<'_, Mutex<AppState>>,
) -> Result<Vec<FollowedBroadcaster>, Error> {
    let state = state.lock().await;
    let token = get_access_token(&state).await;

    let token = match token {
        Ok(token) => token,
        Err(_) => return Ok(vec![]),
    };

    let channels: Vec<FollowedBroadcaster> = state
        .helix
        .get_followed_channels(&token.user_id, token)
        .try_collect()
        .await
        .unwrap_or_default();

    Ok(channels)
}
