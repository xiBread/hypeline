use anyhow::anyhow;
use serde::Serialize;
use tauri::async_runtime::Mutex;
use tauri::State;
use twitch_api::helix::chat::BadgeSet;
use twitch_api::helix::streams::Stream;

use super::channels::get_stream;
use super::users::{get_user_from_login, User};
use crate::emotes::{fetch_user_emotes, EmoteMap};
use crate::error::Error;
use crate::providers::twitch::{fetch_channel_badges, fetch_global_badges};
use crate::AppState;

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
    login: String,
) -> Result<JoinedChannel, Error> {
    let (helix, token, irc) = {
        let state = state.lock().await;

        let token = state
            .token
            .as_ref()
            .ok_or_else(|| Error::Generic(anyhow!("Access token not set")))?;

        let Some(irc) = state.irc.clone() else {
            return Err(Error::Generic(anyhow!("No IRC connection")));
        };

        (state.helix.clone(), token.clone(), irc)
    };

    let user = get_user_from_login(state.clone(), login)
        .await?
        .expect("user not found");

    let broadcaster_id = user.data.id.as_str();
    let login = user.data.login.to_string();

    let (stream, emotes, mut global_badges, channel_badges) = tokio::try_join!(
        get_stream(state.clone(), user.data.id.to_string()),
        fetch_user_emotes(broadcaster_id),
        fetch_global_badges(&helix, &token),
        fetch_channel_badges(&helix, &token, login),
    )?;

    global_badges.extend(channel_badges);

    irc.join(user.data.login.to_string());

    Ok(JoinedChannel {
        id: broadcaster_id.to_string(),
        user,
        stream,
        emotes,
        badges: global_badges,
    })
}

#[tauri::command]
pub async fn leave(state: State<'_, Mutex<AppState>>, channel: String) -> Result<(), Error> {
    let state = state.lock().await;

    if let Some(ref irc) = state.irc {
        irc.part(channel);
    }

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
