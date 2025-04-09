use std::error::Error;

use tauri::async_runtime::{self, Mutex};
use tauri::Manager;
use tauri_plugin_svelte::ManagerExt;
use twitch_api::twitch_oauth2::{AccessToken, UserToken};
use twitch_api::HelixClient;

mod api;
mod chat;
mod emotes;
mod error;
mod providers;
mod users;

pub struct AppState {
    helix: HelixClient<'static, reqwest::Client>,
    access_token: Option<UserToken>,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let mut builder = tauri::Builder::default();

    #[cfg(desktop)]
    {
        builder = builder.plugin(tauri_plugin_single_instance::init(|app, _, _| {
            let _ = app
                .get_webview_window("main")
                .expect("no main window")
                .set_focus();
        }));
    }

    builder
        .plugin(tauri_plugin_svelte::init())
        .plugin(tauri_plugin_window_state::Builder::new().build())
        .plugin(
            tauri_plugin_log::Builder::new()
                .level_for("hyper_util", log::LevelFilter::Off)
                .level_for("rustls", log::LevelFilter::Off)
                .level_for("tao", log::LevelFilter::Off)
                .level_for("tokio_tungstenite", log::LevelFilter::Off)
                .level_for("tracing", log::LevelFilter::Off)
                .level_for("tungstenite", log::LevelFilter::Off)
                .build(),
        )
        .plugin(tauri_plugin_websocket::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let app_handle = app.handle();

            async_runtime::block_on(async {
                let stored_token = app_handle
                    .svelte()
                    .get("settings", "user")
                    .and_then(|user| user["token"].as_str().map(|t| t.to_string()));

                let helix = HelixClient::new();

                let access_token = if let Some(token) = stored_token {
                    UserToken::from_token(&helix, AccessToken::from(token))
                        .await
                        .ok()
                } else {
                    None
                };

                let app_state = AppState {
                    helix,
                    access_token,
                };

                Ok::<_, Box<dyn Error>>(app.manage(Mutex::new(app_state)))
            })?;

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            api::set_access_token,
            api::get_followed_channels,
            api::get_current_user,
            api::create_eventsub_subscription,
            chat::join_chat,
            chat::send_message,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
