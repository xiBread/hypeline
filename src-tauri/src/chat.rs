use anyhow::anyhow;
use tauri::async_runtime::Mutex;
use tauri::State;
use twitch_api::eventsub;

use crate::emotes::save_emotes;
use crate::error::Error;
use crate::providers::{bttv, ffz, seventv};
use crate::AppState;

#[tauri::command]
pub async fn join_chat(
    state: State<'_, Mutex<AppState>>,
    session_id: String,
    channel: String,
) -> Result<String, Error> {
    let state = state.lock().await;

    if state.access_token.is_none() {
        return Err(Error::Generic(anyhow!("Access token not set")));
    }

    let token = state.access_token.as_ref().unwrap();
    let user_id = token.user_id.clone();

    let broadcaster = state
        .helix
        .get_user_from_login(channel.as_str(), token)
        .await?;

    let broadcaster = broadcaster.expect("user not found");
    let broadcaster_id = broadcaster.id.as_str();

    let mut seventv_emotes = seventv::fetch_emotes(broadcaster_id).await?;
    let bttv_emotes = bttv::fetch_emotes(broadcaster_id).await?;
    let ffz_emotes = ffz::fetch_emotes(broadcaster_id).await?;

    seventv_emotes.extend(bttv_emotes);
    seventv_emotes.extend(ffz_emotes);

    save_emotes(&state.emotes, &broadcaster, seventv_emotes).await?;

    state
        .helix
        .create_eventsub_subscription(
            eventsub::channel::ChannelChatMessageV1::new(broadcaster_id, user_id),
            eventsub::Transport::websocket(session_id),
            token,
        )
        .await?;

    Ok(broadcaster_id.to_string())
}

#[tauri::command]
pub async fn send_message(
    state: State<'_, Mutex<AppState>>,
    content: String,
    broadcaster_id: String,
) -> Result<(), Error> {
    let state = state.lock().await;

    if state.access_token.is_none() {
        return Err(Error::Generic(anyhow!("Access token not set")));
    }

    let token = state.access_token.as_ref().unwrap();
    let user_id = token.user_id.clone();

    state
        .helix
        .send_chat_message(broadcaster_id.as_str(), user_id, content.as_str(), token)
        .await?;

    Ok(())
}
