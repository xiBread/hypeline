pub mod client;
mod emotes;

pub use client::SeventTvClient;
pub use emotes::*;
use tauri::ipc::Channel;
use tauri::AppHandle;

#[tauri::command]
pub async fn connect_seventv(app_handle: AppHandle, channel: Channel<()>) {}
