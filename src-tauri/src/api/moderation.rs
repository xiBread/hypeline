use anyhow::anyhow;
use serde::Deserialize;
use tauri::State;
use tokio::sync::Mutex;
use twitch_api::helix::chat::{UpdateChatSettingsBody, UpdateChatSettingsRequest};
use twitch_api::helix::moderation::manage_held_automod_messages;
use twitch_api::helix::moderation::update_shield_mode_status::{
    UpdateShieldModeStatusBody, UpdateShieldModeStatusRequest,
};
use twitch_api::twitch_oauth2::TwitchToken;

use super::get_access_token;
use crate::error::Error;
use crate::{AppState, HTTP};

#[tracing::instrument(skip(state))]
#[tauri::command]
pub async fn delete_message(
    state: State<'_, Mutex<AppState>>,
    broadcaster_id: String,
    message_id: String,
) -> Result<(), Error> {
    let state = state.lock().await;
    let token = get_access_token(&state)?;

    state
        .helix
        .delete_chat_message(broadcaster_id, &token.user_id, message_id, token)
        .await?;

    tracing::debug!("Deleted message");

    Ok(())
}

#[tracing::instrument(skip(state))]
#[tauri::command]
pub async fn clear_chat(
    state: State<'_, Mutex<AppState>>,
    broadcaster_id: String,
) -> Result<(), Error> {
    let state = state.lock().await;
    let token = get_access_token(&state)?;

    state
        .helix
        .delete_all_chat_message(broadcaster_id, &token.user_id, token)
        .await?;

    tracing::debug!("Cleared chat");

    Ok(())
}

#[tracing::instrument(skip(state))]
#[tauri::command]
pub async fn update_held_message(
    state: State<'_, Mutex<AppState>>,
    message_id: String,
    allow: bool,
) -> Result<(), Error> {
    let state = state.lock().await;
    let token = get_access_token(&state)?;

    let request = manage_held_automod_messages::ManageHeldAutoModMessagesRequest::new();
    let body = manage_held_automod_messages::ManageHeldAutoModMessagesBody::new(
        &token.user_id,
        message_id,
        allow,
    );

    state.helix.req_post(request, body, token).await?;

    tracing::debug!("Updated held message");

    Ok(())
}

#[tracing::instrument(skip(state))]
#[tauri::command]
pub async fn ban(
    state: State<'_, Mutex<AppState>>,
    broadcaster_id: String,
    user_id: String,
    duration: Option<u32>,
    reason: Option<String>,
) -> Result<(), Error> {
    let state = state.lock().await;
    let token = get_access_token(&state)?;

    state
        .helix
        .ban_user(
            user_id,
            reason.unwrap_or_default().as_str(),
            duration,
            broadcaster_id,
            &token.user_id,
            token,
        )
        .await?;

    if duration.is_some() {
        tracing::debug!("Timed out user");
    } else {
        tracing::debug!("Banned user");
    }

    Ok(())
}

#[tracing::instrument(skip(state))]
#[tauri::command]
pub async fn unban(
    state: State<'_, Mutex<AppState>>,
    broadcaster_id: String,
    user_id: String,
) -> Result<(), Error> {
    let state = state.lock().await;
    let token = get_access_token(&state)?;

    state
        .helix
        .unban_user(user_id, broadcaster_id, &token.user_id, token)
        .await?;

    tracing::debug!("Unbanned/untimed user");

    Ok(())
}

#[tracing::instrument(skip(state))]
#[tauri::command]
pub async fn warn(
    state: State<'_, Mutex<AppState>>,
    broadcaster_id: String,
    user_id: String,
    reason: String,
) -> Result<(), Error> {
    let state = state.lock().await;
    let token = get_access_token(&state)?;

    state
        .helix
        .warn_chat_user(user_id, &*reason, broadcaster_id, &token.user_id, token)
        .await?;

    tracing::debug!("Warned user");

    Ok(())
}

#[tracing::instrument(skip(state))]
#[tauri::command]
pub async fn add_moderator(
    state: State<'_, Mutex<AppState>>,
    broadcaster_id: String,
    user_id: String,
) -> Result<(), Error> {
    let state = state.lock().await;
    let token = get_access_token(&state)?;

    let response = HTTP
        .post("https://api.twitch.tv/helix/moderation/moderators")
        .query(&[("broadcaster_id", broadcaster_id), ("user_id", user_id)])
        .header("Client-Id", token.client_id().as_str())
        .bearer_auth(token.access_token.as_str())
        .send()
        .await?;

    if response.status().is_client_error() {
        let error = response.json::<serde_json::Value>().await?;

        Err(Error::Generic(anyhow!(
            "{}",
            error["message"].as_str().unwrap_or_default()
        )))
    } else {
        tracing::debug!("Added moderator");

        Ok(())
    }
}

#[tracing::instrument(skip(state))]
#[tauri::command]
pub async fn remove_moderator(
    state: State<'_, Mutex<AppState>>,
    broadcaster_id: String,
    user_id: String,
) -> Result<(), Error> {
    let state = state.lock().await;
    let token = get_access_token(&state)?;

    let response = HTTP
        .delete("https://api.twitch.tv/helix/moderation/moderators")
        .query(&[("broadcaster_id", broadcaster_id), ("user_id", user_id)])
        .header("Client-Id", token.client_id().as_str())
        .bearer_auth(token.access_token.as_str())
        .send()
        .await?;

    if response.status().is_client_error() {
        let error = response.json::<serde_json::Value>().await?;

        Err(Error::Generic(anyhow!(
            "{}",
            error["message"].as_str().unwrap_or_default()
        )))
    } else {
        tracing::debug!("Removed moderator");

        Ok(())
    }
}

#[tauri::command]
pub async fn shield(
    state: State<'_, Mutex<AppState>>,
    broadcaster_id: String,
    active: bool,
) -> Result<(), Error> {
    let state = state.lock().await;
    let token = get_access_token(&state)?;

    let request = UpdateShieldModeStatusRequest::new(&broadcaster_id, &token.user_id);
    let body = UpdateShieldModeStatusBody::is_active(active);

    state.helix.req_put(request, body, token).await?;

    Ok(())
}

#[derive(Debug, Deserialize)]
pub struct ChatSettings {
    unique: Option<bool>,
    emote_only: Option<bool>,
    subscriber_only: Option<bool>,
    follower_only: Option<bool>,
    follower_only_duration: Option<u64>,
    slow_mode: Option<u64>,
}

#[tracing::instrument(skip(state))]
#[tauri::command]
pub async fn update_chat_settings(
    state: State<'_, Mutex<AppState>>,
    broadcaster_id: String,
    settings: ChatSettings,
) -> Result<(), Error> {
    let state = state.lock().await;
    let token = get_access_token(&state)?;

    let request = UpdateChatSettingsRequest::new(&broadcaster_id, &token.user_id);
    let mut body = UpdateChatSettingsBody::default();

    body.unique_chat_mode = settings.unique;
    body.emote_mode = settings.emote_only;
    body.subscriber_mode = settings.subscriber_only;

    body.follower_mode = settings.follower_only;
    body.follower_mode_duration = settings.follower_only_duration;

    if let Some(duration) = settings.slow_mode {
        if duration == 0 {
            body.slow_mode = Some(false);
        } else {
            body.slow_mode = Some(true);
            body.slow_mode_wait_time = Some(duration);
        }
    }

    state.helix.req_patch(request, body, token).await?;

    tracing::debug!("Updated chat settings");

    Ok(())
}
