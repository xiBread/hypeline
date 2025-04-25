use std::ops::Range;

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct BasicUser {
    pub id: String,
    pub login: String,
    pub name: String,
}

/// A single emote, appearing as part of a message.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct Emote {
    pub id: String,
    pub char_range: Range<usize>,
    pub code: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct Badge {
    pub name: String,
    pub version: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ReplyParent {
    pub message_id: String,
    pub message_text: String,
    pub user: BasicUser,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ReplyThread {
    pub message_id: String,
    pub user_login: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct Reply {
    pub parent: ReplyParent,
    pub thread: ReplyThread,
}

pub trait ReplyToMessage {
    /// Login name of the channel that the message was sent to.
    fn channel_login(&self) -> &str;
    /// The unique string identifying the message, specified on the message via the `id` tag.
    fn message_id(&self) -> &str;
}

impl<C, M> ReplyToMessage for (C, M)
where
    C: AsRef<str>,
    M: AsRef<str>,
{
    fn channel_login(&self) -> &str {
        self.0.as_ref()
    }

    fn message_id(&self) -> &str {
        self.1.as_ref()
    }
}
