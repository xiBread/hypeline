use tauri::async_runtime::Mutex;
use tauri::Manager;
use twitch_api::twitch_oauth2::UserToken;
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
            let app_state = AppState {
                access_token: None,
                helix: HelixClient::new(),
            };

            app.manage(Mutex::new(app_state));

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
