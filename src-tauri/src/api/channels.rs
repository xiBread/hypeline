use std::collections::HashMap;

use futures::TryStreamExt;
use serde::Serialize;
use tauri::State;
use tauri::async_runtime::Mutex;
use tokio::try_join;
use twitch_api::helix::channels::FollowedBroadcaster;
use twitch_api::helix::streams::Stream;
use twitch_api::types::Collection;

use super::get_access_token;
use super::users::User;
use crate::AppState;
use crate::error::Error;

#[derive(Serialize)]
pub struct FullChannel {
    user: User,
    stream: Option<Stream>,
}

#[tracing::instrument(skip_all)]
#[tauri::command]
pub async fn get_followed_channels(
    state: State<'_, Mutex<AppState>>,
) -> Result<Vec<FullChannel>, Error> {
    tracing::info!("Fetching followed channels");

    let guard = state.lock().await;
    let token = get_access_token(&guard);

    let token = match token {
        Ok(token) => token,
        Err(_) => return Ok(vec![]),
    };

    let channels: Vec<FollowedBroadcaster> = guard
        .helix
        .get_followed_channels(&token.user_id, token)
        .try_collect()
        .await
        .unwrap_or_default();

    if channels.is_empty() {
        tracing::info!("No followed channels found");
        return Ok(vec![]);
    }

    let user_ids: Vec<_> = channels.iter().map(|c| c.broadcaster_id.as_str()).collect();
    let id_coll = Collection::from(&user_ids);

    let (streams, users, colors) = try_join!(
        guard
            .helix
            .get_followed_streams(token)
            .try_collect::<Vec<_>>(),
        guard
            .helix
            .get_users_from_ids(&id_coll, token)
            .try_collect::<Vec<_>>(),
        guard
            .helix
            .get_users_chat_colors(&id_coll, token)
            .try_collect::<Vec<_>>()
    )?;

    let stream_map: HashMap<_, _> = streams
        .into_iter()
        .map(|stream| (stream.user_id.clone(), stream))
        .collect();

    let user_map: HashMap<_, _> = users
        .into_iter()
        .map(|user| (user.id.clone(), user))
        .collect();

    let color_map: HashMap<_, _> = colors
        .into_iter()
        .map(|u| (u.user_id.clone(), u.color.map(|c| c.to_string())))
        .collect();

    let followed: Vec<_> = channels
        .iter()
        .filter_map(|channel| {
            let user_data = user_map.get(&channel.broadcaster_id);

            let user_data = match user_data {
                Some(data) => data.clone(),
                None => return None,
            };

            let color = color_map.get(&channel.broadcaster_id).cloned().flatten();
            let stream = stream_map.get(&channel.broadcaster_id).cloned();

            Some(FullChannel {
                user: User {
                    data: user_data,
                    color,
                },
                stream,
            })
        })
        .collect();

    tracing::info!("Fetched {} followed channels", followed.len());
    Ok(followed)
}
