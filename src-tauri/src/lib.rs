#![feature(try_blocks)]

use std::sync::{Arc, LazyLock};

use eventsub::EventSubClient;
use irc::IrcClient;
use providers::seventv::SeventTvClient;
use reqwest::header::HeaderMap;
use tauri::async_runtime::{self, Mutex};
use tauri::ipc::Invoke;
use tauri::{AppHandle, Manager, WebviewWindowBuilder, WindowEvent};
use tauri_plugin_svelte::ManagerExt;
use twitch_api::twitch_oauth2::{AccessToken, UserToken};
use twitch_api::HelixClient;

mod api;
mod emotes;
mod error;
mod eventsub;
mod irc;
mod log;
mod providers;
mod server;

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
    token: Option<UserToken>,
    irc: Option<IrcClient>,
    eventsub: Option<Arc<EventSubClient>>,
    seventv: Option<Arc<SeventTvClient>>,
    seventv_id: Option<String>,
}

impl Default for AppState {
    fn default() -> Self {
        Self {
            helix: HelixClient::new(),
            token: None,
            irc: None,
            eventsub: None,
            seventv: None,
            seventv_id: None,
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
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_os::init())
        .setup(|app| {
            let log_guard = log::init_tracing(app);
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

                if let Some(ref token) = access_token {
                    tracing::debug!(
                        token = token.access_token.as_str(),
                        "Using access token from storage",
                    );
                }

                state.token = access_token;
            });

            app.manage(Mutex::new(state));
            app.manage(log_guard);

            Ok(())
        })
        .on_window_event(|window, event| {
            if let WindowEvent::CloseRequested { .. } = event {
                let app_handle = window.app_handle();

                match window.label() {
                    "main" => {
                        if let Some(settings_win) =
                            window.app_handle().get_webview_window("settings")
                        {
                            settings_win
                                .close()
                                .expect("failed to close settings window");
                        }
                    }
                    "settings" => {
                        app_handle
                            .svelte()
                            .save("settings")
                            .expect("failed to save settings while closing window");
                    }
                    _ => (),
                }
            }
        })
        .invoke_handler(get_handler())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
async fn detach_settings(app_handle: AppHandle) {
    let config = app_handle.config();

    let Some(settings) = config.app.windows.get(1) else {
        return;
    };

    WebviewWindowBuilder::from_config(&app_handle, &settings)
        .unwrap()
        .build()
        .unwrap();
}

fn get_handler() -> impl Fn(Invoke) -> bool {
    tauri::generate_handler![
        detach_settings,
        api::channels::get_stream,
        api::channels::get_streams,
        api::channels::get_followed_channels,
        api::chat::join,
        api::chat::leave,
        api::chat::send_message,
        api::chat::fetch_global_badges,
        api::moderation::delete_message,
        api::moderation::update_held_message,
        api::moderation::ban,
        api::users::get_user_from_id,
        api::users::get_user_from_login,
        api::users::get_user_emotes,
        api::users::get_moderated_channels,
        emotes::fetch_global_emotes,
        eventsub::connect_eventsub,
        irc::connect_irc,
        log::log,
        providers::fetch_recent_messages,
        providers::seventv::connect_seventv,
        server::start_server
    ]
}
