use tauri::async_runtime::Mutex;
use tauri::State;
use twitch_api::eventsub;

use crate::error::Error;
use crate::AppState;

use super::get_access_token;

#[tauri::command]
pub async fn subscribe(
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
