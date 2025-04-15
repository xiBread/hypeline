use serde::Serialize;
use tauri::async_runtime::Mutex;
use tauri::State;
use twitch_api::helix::users::User as HelixUser;

use crate::error::Error;
use crate::AppState;

#[derive(Serialize)]
pub struct User {
    pub data: HelixUser,
    pub color: Option<String>,
}

#[tauri::command]
pub async fn get_user_from_id(
    state: State<'_, Mutex<AppState>>,
    id: Option<String>,
) -> Result<Option<User>, Error> {
    let state = state.lock().await;

    let Some(token) = state.token.as_ref() else {
        return Ok(None);
    };

    let user_id = match id {
        Some(id) => id,
        None => token.user_id.to_string(),
    };

    let response = state.helix.get_user_from_id(&user_id, token).await?;

    match response {
        Some(user) => {
            let color_user = state.helix.get_user_chat_color(&user_id, token).await?;

            Ok(Some(User {
                data: user,
                color: color_user.and_then(|u| u.color.map(|c| c.into())),
            }))
        }
        None => Ok(None),
    }
}
