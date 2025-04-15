use std::collections::HashMap;
use std::sync::LazyLock;

use reqwest::header::HeaderMap;
use tauri::async_runtime::{self, Mutex};
use tauri::ipc::Invoke;
use tauri::Manager;
use tauri_plugin_svelte::ManagerExt;
use twitch_api::twitch_oauth2::{AccessToken, UserToken};
use twitch_api::HelixClient;
use users::User;

mod api;
mod emotes;
mod error;
mod providers;
mod users;

const CLIENT_ID: &str = "kimne78kx3ncx6brgo4mv6wki5h1ko";

pub static HTTP: LazyLock<reqwest::Client> = LazyLock::new(|| {
    let mut headers = HeaderMap::new();
    headers.insert("Client-Id", CLIENT_ID.parse().unwrap());
    headers.insert("Content-Type", "application/json".parse().unwrap());

    reqwest::Client::builder()
        .default_headers(headers)
        .build()
        .unwrap()
});

pub struct AppState {
    helix: HelixClient<'static, reqwest::Client>,
    subscriptions: HashMap<String, String>,
    user: User,
}

impl Default for AppState {
    fn default() -> Self {
        Self {
            helix: HelixClient::new(),
            subscriptions: HashMap::default(),
            user: User::default(),
        }
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let mut builder = tauri::Builder::default();
    let mut state = AppState::default();

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

                let access_token = if let Some(token) = stored_token {
                    UserToken::from_token(&state.helix, AccessToken::from(token))
                        .await
                        .ok()
                } else {
                    None
                };

                state.user.token = access_token;
            });

            app.manage(Mutex::new(state));
            Ok(())
        })
        .invoke_handler(get_handler())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

fn get_handler() -> impl Fn(Invoke) -> bool {
    tauri::generate_handler![
        api::set_access_token,
        api::channels::get_stream,
        api::channels::get_followed,
        api::channels::get_chatters,
        api::chat::join,
        api::chat::leave,
        api::chat::send_message,
        api::eventsub::subscribe,
        api::eventsub::unsubscribe,
        api::users::get_current_user,
        api::users::get_user_from_id,
        api::users::get_user_color,
        emotes::fetch_global_emotes,
    ]
}
