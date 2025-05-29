use serde::Deserialize;
use tauri::{async_runtime, AppHandle, Emitter};
use tracing::Instrument;

use crate::error::Error;
use crate::irc::message::{IrcMessage, ServerMessage};
use crate::HTTP;

#[derive(Debug, Deserialize)]
struct RecentMessages {
    #[serde(default)]
    messages: Vec<String>,
}

#[tracing::instrument(skip(app_handle))]
#[tauri::command]
pub async fn fetch_recent_messages(app_handle: AppHandle, channel: String, history_limit: u32) {
    // Return early as to not trigger wakeups
    if history_limit == 0 {
        tracing::debug!("History limit is 0, skipping request");
        return;
    }

    async_runtime::spawn(async move {
        let response: RecentMessages = HTTP
            .get(format!(
                "https://recent-messages.robotty.de/api/v2/recent-messages/{channel}?limit={history_limit}",
            ))
            .send()
            .await?
            .json()
            .await?;

		tracing::info!("Fetched {} recent messages", response.messages.len());

        let server_messages: Vec<_> = response
            .messages
            .into_iter()
            .filter_map(|m| ServerMessage::try_from(IrcMessage::parse(&m).ok()?).ok())
            .collect();

        app_handle.emit("recentmessages", server_messages).unwrap();
        Ok::<_, Error>(())
    }.in_current_span());
}
