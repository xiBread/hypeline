use std::error::Error;

use anyhow::anyhow;
use sqlx::SqlitePool;
use tauri::async_runtime::{self, Mutex};
use tauri::Manager;
use tauri_plugin_store::StoreExt;
use twitch_api::twitch_oauth2::{AccessToken, UserToken};
use twitch_api::HelixClient;

mod api;
mod chat;
mod emotes;
mod error;
mod migrations;
mod providers;

pub struct AppState {
    helix: HelixClient<'static, reqwest::Client>,
    access_token: Option<UserToken>,
    emotes: SqlitePool,
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
        .plugin(tauri_plugin_window_state::Builder::new().build())
        .plugin(
            tauri_plugin_sql::Builder::new()
                .add_migrations("sqlite:emotes.db", migrations::emotes())
                .build(),
        )
        .plugin(
            tauri_plugin_log::Builder::new()
                .level_for("hyper_util", log::LevelFilter::Off)
                .level_for("rustls", log::LevelFilter::Off)
                .level_for("sqlx", log::LevelFilter::Off)
                .level_for("tao", log::LevelFilter::Off)
                .level_for("tokio_tungstenite", log::LevelFilter::Off)
                .level_for("tracing", log::LevelFilter::Off)
                .level_for("tungstenite", log::LevelFilter::Off)
                .build(),
        )
        .plugin(tauri_plugin_websocket::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let config_dir = app.path().app_config_dir()?;

            let emote_db_path = config_dir.join("emotes.db");

            async_runtime::block_on(async {
                let store = app.store("settings.json")?;
                let stored_token = store
                    .get("user")
                    .and_then(|user| user["accessToken"].as_str().map(|s| s.to_string()));

                let helix = HelixClient::new();

                let access_token = if let Some(token) = stored_token {
                    UserToken::from_token(&helix, AccessToken::from(token))
                        .await
                        .ok()
                } else {
                    None
                };

                let emotes = SqlitePool::connect(emote_db_path.to_str().unwrap())
                    .await
                    .map_err(|e| anyhow!("error connecting to emote database: {}", e))?;

                let app_state = AppState {
                    helix: helix.clone(),
                    access_token,
                    emotes,
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
