use serde::Deserialize;

use crate::error::Error;
use crate::irc::message::{IrcMessage, ServerMessage};
use crate::HTTP;

#[derive(Debug, Deserialize)]
struct RecentMessages {
    #[serde(default)]
    messages: Vec<String>,
}

pub async fn get_recent_messages(channel: String, limit: u32) -> Result<Vec<ServerMessage>, Error> {
    // Return early as to not trigger wakeups
    if limit == 0 {
        return Ok(vec![]);
    }

    let response: RecentMessages = HTTP
        .get(format!(
            "https://recent-messages.robotty.de/api/v2/recent-messages/{channel}?limit={limit}"
        ))
        .send()
        .await?
        .json()
        .await?;

    let server_messages: Vec<_> = response
        .messages
        .into_iter()
        .filter_map(|m| ServerMessage::try_from(IrcMessage::parse(&m).ok()?).ok())
        .collect();

    Ok(server_messages)
}
