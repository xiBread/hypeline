use std::collections::HashMap;

use anyhow::anyhow;
use futures::TryStreamExt;
use serde::Serialize;
use tauri::async_runtime::Mutex;
use tauri::State;
use twitch_api::eventsub;
use twitch_api::helix::channels::FollowedBroadcaster;
use twitch_api::helix::chat::Chatter;
use twitch_api::helix::streams::Stream;
use twitch_api::helix::users::User;
use twitch_api::twitch_oauth2::{AccessToken, UserToken};

use crate::error::Error;
use crate::AppState;

#[derive(Serialize)]
pub struct FollowedChannel {
    user_id: String,
    user_login: String,
    user_name: String,
    profile_image_url: String,
    stream: Option<Stream>,
}

async fn get_access_token<'a>(state: &'a AppState) -> Result<&'a UserToken, Error> {
    state
        .user
        .token
        .as_ref()
        .ok_or_else(|| Error::Generic(anyhow!("Access token not set")))
}

#[tauri::command]
pub async fn set_access_token(state: State<'_, Mutex<AppState>>, token: String) -> Result<(), ()> {
    let mut state = state.lock().await;

    state.user.token = UserToken::from_token(&state.helix, AccessToken::from(token))
        .await
        .ok();

    Ok(())
}

#[tauri::command]
pub async fn get_followed_channels(
    state: State<'_, Mutex<AppState>>,
) -> Result<Vec<FollowedChannel>, Error> {
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
        .await?;

    let streams: Vec<Stream> = state
        .helix
        .get_followed_streams(token)
        .try_collect()
        .await?;

    let stream_map: HashMap<_, _> = streams
        .iter()
        .map(|stream| (stream.user_id.clone(), stream))
        .collect();

    let user_ids: Vec<&str> = channels.iter().map(|c| c.broadcaster_id.as_str()).collect();

    let users: Vec<User> = if user_ids.is_empty() {
        vec![]
    } else {
        state
            .helix
            .get_users_from_ids(&user_ids[..].into(), token)
            .try_collect()
            .await?
    };

    let user_map: HashMap<_, _> = users.iter().map(|user| (user.id.clone(), user)).collect();

    let followed = channels
        .iter()
        .map(|channel| {
            let user = user_map.get(&channel.broadcaster_id);
            let stream = stream_map.get(&channel.broadcaster_id).map(|&s| s);

            FollowedChannel {
                user_id: channel.broadcaster_id.to_string(),
                user_login: channel.broadcaster_login.to_string(),
                user_name: channel.broadcaster_name.to_string(),
                profile_image_url: user
                    .and_then(|u| u.profile_image_url.clone())
                    .unwrap_or_default(),
                stream: stream.cloned(),
            }
        })
        .collect();

    Ok(followed)
}

#[tauri::command]
pub async fn get_current_user(state: State<'_, Mutex<AppState>>) -> Result<Option<User>, Error> {
    let mut state = state.lock().await;
    let token = get_access_token(&state).await?;

    let response = state.helix.get_user_from_id(&token.user_id, token).await?;

    if state.user.data.is_none() {
        if let Some(ref user) = response {
            state.user.data = Some(user.clone());
        }
    }

    Ok(response)
}

#[tauri::command]
pub async fn get_chatters(
    state: State<'_, Mutex<AppState>>,
    channel_id: String,
) -> Result<Vec<Chatter>, Error> {
    let state = state.lock().await;
    let token = get_access_token(&state).await?;

    let response = state
        .helix
        .get_chatters(&channel_id, &token.user_id, 1000, token)
        .try_collect()
        .await;

    match response {
        Ok(chatters) => Ok(chatters),
        Err(_) => Ok(vec![]),
    }
}

#[tauri::command]
pub async fn create_eventsub_subscription(
    state: State<'_, Mutex<AppState>>,
    session_id: String,
    event: String,
    condition: serde_json::Value,
) -> Result<(), Error> {
    let state = state.lock().await;
    let token = get_access_token(&state).await?;

    let transport = eventsub::Transport::websocket(session_id);
    let user_id = token.user_id.clone();

    match event.as_str() {
        "user.update" => {
            state
                .helix
                .create_eventsub_subscription(
                    eventsub::user::UserUpdateV1::new(user_id),
                    transport,
                    token,
                )
                .await
                .ok();
        }
        _ => {
            eprintln!("Invalid or unimplemented event type");
        }
    };

    Ok(())
}
