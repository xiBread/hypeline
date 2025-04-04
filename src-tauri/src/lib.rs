use std::error::Error;

use tauri::async_runtime::{self, Mutex};
use tauri::Manager;
use tauri_plugin_store::StoreExt;
use twitch_api::twitch_oauth2::{AccessToken, UserToken};
use twitch_api::HelixClient;

mod api;

pub struct AppState {
    helix: HelixClient<'static, reqwest::Client>,
    access_token: Option<UserToken>,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_log::Builder::new().build())
        .plugin(tauri_plugin_websocket::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            async_runtime::block_on(async {
                let store = app.store("settings.json")?;
                let stored_token = store
                    .get("user")
                    .and_then(|user| user["accessToken"].as_str().map(|s| s.to_string()));

                let helix = HelixClient::new();

            let app_state = AppState {
                    helix: helix.clone(),
                    access_token: if let Some(token) = stored_token {
                        UserToken::from_token(&helix, AccessToken::from(token))
                            .await
                            .ok()
                    } else {
                        None
                    },
            };

                Ok::<_, Box<dyn Error>>(app.manage(Mutex::new(app_state)))
            })?;

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            api::set_access_token,
            api::get_current_user,
            api::create_eventsub_subscription,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
