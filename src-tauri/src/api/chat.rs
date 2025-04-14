use anyhow::anyhow;
use serde::Serialize;
use serde_json::json;
use tauri::async_runtime::Mutex;
use tauri::State;
use twitch_api::helix::chat::BadgeSet;

use crate::emotes::{fetch_user_emotes, EmoteMap};
use crate::error::Error;
use crate::providers::twitch::{fetch_channel_badges, fetch_global_badges};
use crate::AppState;

use super::eventsub::{subscribe_all, unsubscribe};

#[derive(Serialize)]
pub struct Chat {
    channel_id: String,
    emotes: EmoteMap,
    badges: Vec<BadgeSet>,
}

#[tauri::command]
pub async fn join(
    state: State<'_, Mutex<AppState>>,
    session_id: String,
    channel: String,
) -> Result<Chat, Error> {
    let guard = state.lock().await;

    let token = guard
        .user
        .token
        .as_ref()
        .ok_or_else(|| Error::Generic(anyhow!("Access token not set")))?;

    let user_id = token.user_id.clone();

    let broadcaster = guard
        .helix
        .get_user_from_login(channel.as_str(), token)
        .await?;

    let broadcaster = broadcaster.expect("user not found");
    let broadcaster_id = broadcaster.id.as_str();

    let emotes = fetch_user_emotes(broadcaster_id).await?;

    let mut global_badges = fetch_global_badges(&guard.helix, &token).await?;
    let channel_badges = fetch_channel_badges(&guard.helix, &token, channel).await?;

    drop(guard);

    global_badges.extend(channel_badges);

    let channel_condition = json!({
        "broadcaster_user_id": broadcaster_id,
        "user_id": user_id
    });

    subscribe_all(
        state.clone(),
        session_id,
        &[
            ("channel.chat.message", &channel_condition),
            ("channel.chat.notification", &channel_condition),
        ],
    )
    .await?;

    Ok(Chat {
        channel_id: broadcaster_id.to_string(),
        emotes,
        badges: global_badges,
    })
}

#[tauri::command]
pub async fn leave(state: State<'_, Mutex<AppState>>) -> Result<(), Error> {
    unsubscribe(state, "channel.chat.message".into()).await?;

    Ok(())
}

#[tauri::command]
pub async fn send_message(
    state: State<'_, Mutex<AppState>>,
    content: String,
    broadcaster_id: String,
) -> Result<(), Error> {
    let state = state.lock().await;

    if state.user.token.is_none() {
        return Err(Error::Generic(anyhow!("Access token not set")));
    }

    let token = state.user.token.as_ref().unwrap();
    let user_id = token.user_id.clone();

    state
        .helix
        .send_chat_message(broadcaster_id.as_str(), user_id, content.as_str(), token)
        .await?;

    Ok(())
}
