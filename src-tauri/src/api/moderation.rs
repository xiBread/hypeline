use tauri::State;
use tokio::sync::Mutex;
use twitch_api::helix::moderation::manage_held_automod_messages;

use super::get_access_token;
use crate::error::Error;
use crate::AppState;

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

    Ok(())
}

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

    Ok(())
}

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

    Ok(())
}
