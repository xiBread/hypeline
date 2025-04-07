use anyhow::anyhow;
use serde::Serialize;
use tauri::async_runtime::Mutex;
use tauri::State;
use twitch_api::eventsub;
use twitch_api::helix::chat::BadgeSet;

use crate::emotes::{save_emotes, EmoteMap};
use crate::error::Error;
use crate::providers::twitch::{fetch_channel_badges, fetch_global_badges};
use crate::providers::{bttv, ffz, seventv};
use crate::AppState;

#[derive(Serialize)]
pub struct Chat {
    channel_id: String,
    emotes: EmoteMap,
    badges: Vec<BadgeSet>,
}

#[tauri::command]
pub async fn join_chat(
    state: State<'_, Mutex<AppState>>,
    session_id: String,
    channel: String,
) -> Result<Chat, Error> {
    let state = state.lock().await;

    let token = state
        .access_token
        .as_ref()
        .ok_or_else(|| Error::Generic(anyhow!("Access token not set")))?;

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

    save_emotes(&state.db, &broadcaster, &seventv_emotes).await?;

    let mut global_badges = fetch_global_badges(&state.helix, &token).await?;
    let channel_badges = fetch_channel_badges(&state.helix, &token, channel).await?;

    global_badges.extend(channel_badges);

    state
        .helix
        .create_eventsub_subscription(
            eventsub::channel::ChannelChatMessageV1::new(broadcaster_id, user_id),
            eventsub::Transport::websocket(session_id),
            token,
        )
        .await?;

    Ok(Chat {
        channel_id: broadcaster_id.to_string(),
        emotes: seventv_emotes,
        badges: global_badges,
    })
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
