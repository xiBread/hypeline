use tauri::State;
use tokio::sync::Mutex;

use super::get_access_token;
use crate::error::Error;
use crate::AppState;

#[tauri::command]
pub async fn delete_message(
    state: State<'_, Mutex<AppState>>,
    broadcaster_id: String,
    user_id: String,
    message_id: String,
) -> Result<(), Error> {
    let state = state.lock().await;
    let token = get_access_token(&state).await?;

    state
        .helix
        .delete_chat_message(broadcaster_id, user_id, message_id, token)
        .await?;

    Ok(())
}
