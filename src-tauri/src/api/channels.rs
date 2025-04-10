use std::collections::HashMap;

use futures::TryStreamExt;
use serde::Serialize;
use tauri::async_runtime::Mutex;
use tauri::State;
use twitch_api::helix::channels::FollowedBroadcaster;
use twitch_api::helix::chat::Chatter;
use twitch_api::helix::streams::Stream;
use twitch_api::helix::users::User;

use crate::error::Error;
use crate::AppState;

use super::get_access_token;

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

#[derive(Serialize)]
pub struct FollowedChannel {
    user_id: String,
    user_login: String,
    user_name: String,
    profile_image_url: String,
    stream: Option<Stream>,
}

#[tauri::command]
pub async fn get_followed(
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
