use anyhow::anyhow;
use serde::Serialize;
use serde_json::json;
use tauri::async_runtime::Mutex;
use tauri::State;
use twitch_api::helix::chat::BadgeSet;
use twitch_api::helix::streams::Stream;

use crate::emotes::{fetch_user_emotes, EmoteMap};
use crate::error::Error;
use crate::providers::twitch::{fetch_channel_badges, fetch_global_badges};
use crate::AppState;

use super::channels::get_stream;
use super::eventsub::{subscribe_all, unsubscribe_all};
use super::users::{get_user_from_id, User};

#[derive(Serialize)]
pub struct JoinedChannel {
    id: String,
    user: User,
    stream: Option<Stream>,
    emotes: EmoteMap,
    badges: Vec<BadgeSet>,
}

#[tauri::command]
pub async fn join(
    state: State<'_, Mutex<AppState>>,
    session_id: String,
    id: String,
) -> Result<JoinedChannel, Error> {
    let (helix, token) = {
        let state = state.lock().await;

        let token = state
            .token
            .as_ref()
            .ok_or_else(|| Error::Generic(anyhow!("Access token not set")))?;

        (state.helix.clone(), token.clone())
    };

    let user_id = token.user_id.clone();

    let user = get_user_from_id(state.clone(), Some(id.to_string()))
        .await?
        .unwrap();

    let broadcaster_id = user.data.id.as_str();
    let login = user.data.login.to_string();

    let (stream, emotes, mut global_badges, channel_badges) = tokio::try_join!(
        get_stream(state.clone(), id.to_string()),
        fetch_user_emotes(broadcaster_id),
        fetch_global_badges(&helix, &token),
        fetch_channel_badges(&helix, &token, login),
    )?;

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

    Ok(JoinedChannel {
        id: broadcaster_id.to_string(),
        user,
        stream,
        emotes,
        badges: global_badges,
    })
}

#[tauri::command]
pub async fn leave(state: State<'_, Mutex<AppState>>) -> Result<(), Error> {
    unsubscribe_all(
        state,
        &["channel.chat.message", "channel.chat.notification"],
    )
    .await?;

    Ok(())
}

#[tauri::command]
pub async fn send_message(
    state: State<'_, Mutex<AppState>>,
    content: String,
    broadcaster_id: String,
    reply_id: Option<String>,
) -> Result<(), Error> {
    let state = state.lock().await;

    if state.token.is_none() {
        return Err(Error::Generic(anyhow!("Access token not set")));
    }

    let token = state.token.as_ref().unwrap();
    let user_id = token.user_id.clone();

    if let Some(reply_id) = reply_id {
        state
            .helix
            .send_chat_message_reply(&broadcaster_id, user_id, &reply_id, content.as_str(), token)
            .await?;
    } else {
        state
            .helix
            .send_chat_message(&broadcaster_id, user_id, content.as_str(), token)
            .await?;
    }

    Ok(())
}
