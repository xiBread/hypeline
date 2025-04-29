pub mod client;

pub use client::EventSubClient;
use tauri::async_runtime::Mutex;
use tauri::State;

use crate::api::get_access_token;
use crate::error::Error;
use crate::AppState;

#[tauri::command]
pub async fn connect_eventsub(state: State<'_, Mutex<AppState>>) -> Result<(), Error> {
    let state = state.lock().await;
    let token = get_access_token(&state).await?;

    let (mut incoming, client) = EventSubClient::new(&state.helix, token);

    client.connect().await;

    Ok(())
}
