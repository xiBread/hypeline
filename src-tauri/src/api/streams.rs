use futures::TryStreamExt;
use tauri::State;
use tauri::async_runtime::Mutex;
use twitch_api::helix::streams::{CreatedStreamMarker, Stream};

use super::get_access_token;
use crate::AppState;
use crate::error::Error;

#[tauri::command]
pub async fn get_stream(
    state: State<'_, Mutex<AppState>>,
    id: String,
) -> Result<Option<Stream>, Error> {
    let mut streams = get_streams(state, vec![id]).await?;

    Ok(streams.pop())
}

#[tauri::command]
pub async fn get_streams(
    state: State<'_, Mutex<AppState>>,
    ids: Vec<String>,
) -> Result<Vec<Stream>, Error> {
    let state = state.lock().await;
    let token = get_access_token(&state)?;

    let streams = state
        .helix
        .get_streams_from_ids(&ids.into(), token)
        .try_collect()
        .await?;

    Ok(streams)
}

#[tauri::command]
pub async fn create_marker(
    state: State<'_, Mutex<AppState>>,
    broadcaster_id: String,
    description: String,
) -> Result<CreatedStreamMarker, Error> {
    let state = state.lock().await;
    let token = get_access_token(&state)?;

    let marker = state
        .helix
        .create_stream_marker(&broadcaster_id, &description, token)
        .await?;

    Ok(marker)
}
