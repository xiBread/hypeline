use tauri::async_runtime::Mutex;
use tauri::State;
use twitch_api::eventsub;
use twitch_api::helix::users::User;
use twitch_api::twitch_oauth2::{AccessToken, UserToken};

use crate::AppState;

#[tauri::command]
pub async fn set_access_token(state: State<'_, Mutex<AppState>>, token: String) -> Result<(), ()> {
    let mut state = state.lock().await;

    state.access_token = UserToken::from_token(&state.helix, AccessToken::from(token))
        .await
        .ok();

    Ok(())
}

#[tauri::command]
pub async fn get_current_user(state: State<'_, Mutex<AppState>>) -> Result<Option<User>, String> {
    let state = state.lock().await;

    if let Some(ref token) = state.access_token {
        let res = state.helix.get_user_from_id(&token.user_id, token).await;

        if res.is_ok() {
            return Ok(res.unwrap());
        }
    }

    Err("Access token not set".into())
}

#[tauri::command]
pub async fn create_eventsub_subscription(
    state: State<'_, Mutex<AppState>>,
    session_id: String,
    event: String,
    condition: serde_json::Value,
) -> Result<(), String> {
    let state = state.lock().await;

    if let Some(ref token) = state.access_token {
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
            "channel.chat.message" => {
                state
                    .helix
                    .create_eventsub_subscription(
                        eventsub::channel::ChannelChatMessageV1::new(
                            condition["broadcaster_user_id"].as_str().unwrap(),
                            user_id,
                        ),
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

        return Ok(());
    }

    Err("Access token not set".into())
}
