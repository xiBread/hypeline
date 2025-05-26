use std::collections::{HashMap, HashSet};

use futures::TryStreamExt;
use serde::Serialize;
use tauri::async_runtime::Mutex;
use tauri::State;
use twitch_api::helix::users::User as HelixUser;
use twitch_api::types::{Collection, EmoteAnimationSetting, UserId};

use crate::error::Error;
use crate::{AppState, HTTP};

#[derive(Serialize)]
pub struct UserEmote {
    set_id: String,
    id: String,
    name: String,
    #[serde(rename = "type")]
    kind: String,
    format: String,
    owner: String,
    owner_profile_picture_url: String,
}

#[derive(Serialize)]
pub struct User {
    pub data: HelixUser,
    pub color: Option<String>,
}

#[tracing::instrument(skip_all)]
#[tauri::command]
pub async fn get_user_from_id(
    state: State<'_, Mutex<AppState>>,
    id: Option<String>,
) -> Result<Option<User>, Error> {
    let mut state = state.lock().await;

    let Some(ref token) = state.token else {
        return Ok(None);
    };

    let id = id.unwrap_or_else(|| token.user_id.to_string());

    let (helix_user, color_user) = tokio::try_join!(
        state.helix.get_user_from_id(&id, token),
        state.helix.get_user_chat_color(&id, token),
    )?;

    let stv_user = HTTP
        .get(format!("https://7tv.io/v3/users/twitch/{id}"))
        .send()
        .await?
        .json::<serde_json::Value>()
        .await;

    state.seventv_id = stv_user
        .ok()
        .and_then(|u| Some(u["user"]["id"].as_str()?.to_string()));

    let Some(user) = helix_user else {
        tracing::debug!("User not found: {id}");
        return Ok(None);
    };

    let color = color_user.and_then(|u| u.color.map(|c| c.into()));

    Ok(Some(User { data: user, color }))
}

#[tracing::instrument(skip_all)]
#[tauri::command]
pub async fn get_user_from_login(
    state: State<'_, Mutex<AppState>>,
    login: String,
) -> Result<Option<User>, Error> {
    let state = state.lock().await;

    let Some(ref token) = state.token else {
        return Ok(None);
    };

    let helix_user = state.helix.get_user_from_login(&login, token).await?;

    let Some(user) = helix_user else {
        tracing::debug!("User not found: {login}");
        return Ok(None);
    };

    let color_user = state.helix.get_user_chat_color(&user.id, token).await?;
    let color = color_user.and_then(|u| u.color.map(|c| c.into()));

    Ok(Some(User { data: user, color }))
}

#[tauri::command]
pub async fn get_user_emotes(state: State<'_, Mutex<AppState>>) -> Result<Vec<UserEmote>, Error> {
    let state = state.lock().await;

    let Some(token) = state.token.as_ref() else {
        return Ok(vec![]);
    };

    let emotes: Vec<_> = state
        .helix
        .get_user_emotes(&token.user_id, token)
        .try_collect()
        .await?;

    let owner_ids: HashSet<_> = emotes
        .iter()
        .filter_map(|emote| {
            let id_str = emote.owner_id.as_str();

            if id_str.is_empty() || id_str == "twitch" {
                None
            } else {
                Some(id_str.to_string())
            }
        })
        .collect();

    let owner_users = if owner_ids.is_empty() {
        vec![]
    } else {
        let id_coll: Collection<UserId> = owner_ids.into_iter().collect();

        state
            .helix
            .get_users_from_ids(&id_coll, token)
            .try_collect()
            .await?
    };

    let owner_map: HashMap<_, _> = owner_users
        .into_iter()
        .map(|user| (user.id.clone(), user))
        .collect();

    let user_emotes = emotes
        .into_iter()
        .filter_map(|emote| {
            owner_map.get(&emote.owner_id).map(|owner| {
                let format = if emote.format.contains(&EmoteAnimationSetting::Animated) {
                    "animated"
                } else {
                    "static"
                };

                UserEmote {
                    set_id: emote.emote_set_id.into(),
                    id: emote.id.into(),
                    name: emote.name.clone(),
                    kind: emote.emote_type.clone(),
                    format: format.into(),
                    owner: owner.display_name.to_string(),
                    owner_profile_picture_url: owner.profile_image_url.clone().unwrap_or_default(),
                }
            })
        })
        .collect();

    Ok(user_emotes)
}

#[tauri::command]
pub async fn get_moderated_channels(
    state: State<'_, Mutex<AppState>>,
) -> Result<Vec<String>, Error> {
    let state = state.lock().await;

    let Some(token) = state.token.as_ref() else {
        return Ok(vec![]);
    };

    let channels: Vec<_> = state
        .helix
        .get_moderated_channels(token.user_id.clone(), token)
        .try_collect()
        .await?;

    let ids = channels
        .into_iter()
        .map(|ch| ch.broadcaster_login.to_string())
        .collect();

    Ok(ids)
}
