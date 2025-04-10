use tauri::async_runtime::Mutex;
use tauri::State;
use twitch_api::helix::users::User;

use crate::error::Error;
use crate::AppState;

use super::get_access_token;

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
