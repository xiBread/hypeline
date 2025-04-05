use anyhow::anyhow;
use tauri::async_runtime::Mutex;
use tauri::State;
use twitch_api::eventsub;

use crate::emotes::{fetch_7tv_emotes, save_emotes};
use crate::error::Error;
use crate::AppState;

#[tauri::command]
pub async fn join_chat(
    state: State<'_, Mutex<AppState>>,
    session_id: String,
    channel: String,
) -> Result<(), Error> {
    let state = state.lock().await;

    if state.access_token.is_none() {
        return Err(Error::Generic(anyhow!("Access token not set")));
    }

    let token = state.access_token.as_ref().unwrap();
    let user_id = token.user_id.clone();

    let response = state
        .helix
        .get_user_from_login(channel.as_str(), token)
        .await?;

    let broadcaster = response.expect("user not found");
    let broadcaster_id = broadcaster.id.as_str();

    let seventv_emotes = fetch_7tv_emotes(broadcaster_id).await?;
    save_emotes(&state.emotes, &broadcaster, seventv_emotes).await?;

    state
        .helix
        .create_eventsub_subscription(
            eventsub::channel::ChannelChatMessageV1::new(broadcaster_id, user_id),
            eventsub::Transport::websocket(session_id),
            token,
        )
        .await?;

    Ok(())
}
