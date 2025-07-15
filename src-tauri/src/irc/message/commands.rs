use std::collections::HashSet;
use std::str::FromStr;
use std::time::Duration;

use ServerMessageParseError::*;
use serde::{Deserialize, Serialize};
use thiserror::Error;

use super::prefix::IrcPrefix;
use super::{
    AsRawIrc, Badge, BasicUser, Emote, IrcMessage, Reply, ReplyParent, ReplyThread, Source,
};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ClearChatMessage {
    pub channel_login: String,
    pub channel_id: String,
    pub action: ClearChatAction,
    pub is_recent: bool,
    pub server_timestamp: u64,
    pub raw: IrcMessage,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum ClearChatAction {
    #[serde(rename(serialize = "clear"))]
    ChatClear,
    #[serde(rename(serialize = "ban"))]
    UserBan { user_login: String, user_id: String },
    #[serde(rename(serialize = "timeout"))]
    UserTimeout {
        user_login: String,
        user_id: String,
        duration: Duration,
    },
}

impl TryFrom<IrcMessage> for ClearChatMessage {
    type Error = ServerMessageParseError;

    fn try_from(msg: IrcMessage) -> Result<ClearChatMessage, ServerMessageParseError> {
        if msg.command != "CLEARCHAT" {
            return Err(ServerMessageParseError::MismatchedCommand(msg));
        }

        let action = match msg.params.get(1) {
            Some(user_login) => {
                // ban or timeout
                let user_id = msg.try_get_nonempty_tag_value("target-user-id")?;

                let ban_duration = msg.try_get_optional_nonempty_tag_value("ban-duration")?;
                match ban_duration {
                    Some(ban_duration) => {
                        let ban_duration = u64::from_str(ban_duration).map_err(|_| {
                            ServerMessageParseError::MalformedTagValue(
                                msg.to_owned(),
                                "ban-duration",
                                ban_duration.to_owned(),
                            )
                        })?;

                        ClearChatAction::UserTimeout {
                            user_login: user_login.to_owned(),
                            user_id: user_id.to_owned(),
                            duration: Duration::from_secs(ban_duration),
                        }
                    }
                    None => ClearChatAction::UserBan {
                        user_login: user_login.to_owned(),
                        user_id: user_id.to_owned(),
                    },
                }
            }
            None => ClearChatAction::ChatClear,
        };

        Ok(ClearChatMessage {
            channel_login: msg.try_get_channel_login()?.to_owned(),
            channel_id: msg.try_get_nonempty_tag_value("room-id")?.to_owned(),
            action,
            is_recent: msg.try_get_optional_bool("historical")?.unwrap_or_default(),
            server_timestamp: msg.try_get_timestamp("tmi-sent-ts")?,
            raw: msg,
        })
    }
}

impl From<ClearChatMessage> for IrcMessage {
    fn from(msg: ClearChatMessage) -> IrcMessage {
        msg.raw
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ClearMsgMessage {
    pub channel_login: String,
    pub channel_id: String,
    pub sender_login: String,
    pub message_id: String,
    pub message_text: String,
    pub is_action: bool,
    pub is_recent: bool,
    pub server_timestamp: u64,
    pub raw: IrcMessage,
}

impl TryFrom<IrcMessage> for ClearMsgMessage {
    type Error = ServerMessageParseError;

    fn try_from(msg: IrcMessage) -> Result<ClearMsgMessage, ServerMessageParseError> {
        if msg.command != "CLEARMSG" {
            return Err(ServerMessageParseError::MismatchedCommand(msg));
        }

        let (message_text, is_action) = msg.try_get_message_text()?;

        Ok(ClearMsgMessage {
            channel_login: msg.try_get_channel_login()?.to_owned(),
            channel_id: msg.try_get_nonempty_tag_value("room-id")?.to_owned(),
            sender_login: msg.try_get_nonempty_tag_value("login")?.to_owned(),
            message_id: msg.try_get_nonempty_tag_value("target-msg-id")?.to_owned(),
            server_timestamp: msg.try_get_timestamp("tmi-sent-ts")?,
            message_text: message_text.to_owned(),
            is_action,
            is_recent: msg.try_get_optional_bool("historical")?.unwrap_or_default(),
            raw: msg,
        })
    }
}

impl From<ClearMsgMessage> for IrcMessage {
    fn from(msg: ClearMsgMessage) -> IrcMessage {
        msg.raw
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct GlobalUserStateMessage {
    pub user_id: String,
    pub user_name: String,
    pub badge_info: Vec<Badge>,
    pub badges: Vec<Badge>,
    pub emote_sets: HashSet<String>,
    pub name_color: String,
    pub raw: IrcMessage,
}

impl TryFrom<IrcMessage> for GlobalUserStateMessage {
    type Error = ServerMessageParseError;

    fn try_from(msg: IrcMessage) -> Result<GlobalUserStateMessage, ServerMessageParseError> {
        if msg.command != "GLOBALUSERSTATE" {
            return Err(ServerMessageParseError::MismatchedCommand(msg));
        }

        Ok(GlobalUserStateMessage {
            user_id: msg.try_get_nonempty_tag_value("user-id")?.to_owned(),
            user_name: msg.try_get_nonempty_tag_value("display-name")?.to_owned(),
            badge_info: msg.try_get_badges("badge-info")?,
            badges: msg.try_get_badges("badges")?,
            emote_sets: msg.try_get_emote_sets("emote-sets")?,
            name_color: msg.try_get_color("color")?.to_owned(),
            raw: msg,
        })
    }
}

impl From<GlobalUserStateMessage> for IrcMessage {
    fn from(msg: GlobalUserStateMessage) -> IrcMessage {
        msg.raw
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct JoinMessage {
    pub channel_login: String,
    pub user_login: String,
    pub raw: IrcMessage,
}

impl TryFrom<IrcMessage> for JoinMessage {
    type Error = ServerMessageParseError;

    fn try_from(msg: IrcMessage) -> Result<JoinMessage, ServerMessageParseError> {
        if msg.command != "JOIN" {
            return Err(ServerMessageParseError::MismatchedCommand(msg));
        }

        Ok(JoinMessage {
            channel_login: msg.try_get_channel_login()?.to_owned(),
            user_login: msg.try_get_prefix_nickname()?.to_owned(),
            raw: msg,
        })
    }
}

impl From<JoinMessage> for IrcMessage {
    fn from(msg: JoinMessage) -> IrcMessage {
        msg.raw
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct NoticeMessage {
    pub channel_login: Option<String>,
    pub message_text: String,
    pub message_id: Option<String>,
    pub deleted: bool,
    pub is_recent: bool,
    pub recent_timestamp: Option<u64>,
    pub raw: IrcMessage,
}

impl TryFrom<IrcMessage> for NoticeMessage {
    type Error = ServerMessageParseError;

    fn try_from(msg: IrcMessage) -> Result<NoticeMessage, ServerMessageParseError> {
        if msg.command != "NOTICE" {
            return Err(ServerMessageParseError::MismatchedCommand(msg));
        }

        Ok(NoticeMessage {
            channel_login: msg.try_get_optional_channel_login()?.map(|s| s.to_owned()),
            message_text: msg.try_get_param(1)?.to_owned(),
            message_id: msg
                .try_get_optional_nonempty_tag_value("msg-id")?
                .map(|s| s.to_owned()),
            deleted: msg.try_get_optional_bool("rm-deleted")?.unwrap_or_default(),
            is_recent: msg.try_get_optional_bool("historical")?.unwrap_or_default(),
            recent_timestamp: msg.try_get_timestamp("rm-received-ts").ok(),
            raw: msg,
        })
    }
}

impl From<NoticeMessage> for IrcMessage {
    fn from(msg: NoticeMessage) -> IrcMessage {
        msg.raw
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct PartMessage {
    pub channel_login: String,
    pub user_login: String,
    pub raw: IrcMessage,
}

impl TryFrom<IrcMessage> for PartMessage {
    type Error = ServerMessageParseError;

    fn try_from(msg: IrcMessage) -> Result<PartMessage, ServerMessageParseError> {
        if msg.command != "PART" {
            return Err(ServerMessageParseError::MismatchedCommand(msg));
        }

        Ok(PartMessage {
            channel_login: msg.try_get_channel_login()?.to_owned(),
            user_login: msg.try_get_prefix_nickname()?.to_owned(),
            raw: msg,
        })
    }
}

impl From<PartMessage> for IrcMessage {
    fn from(msg: PartMessage) -> IrcMessage {
        msg.raw
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct PingMessage {
    pub raw: IrcMessage,
}

impl TryFrom<IrcMessage> for PingMessage {
    type Error = ServerMessageParseError;

    fn try_from(msg: IrcMessage) -> Result<PingMessage, ServerMessageParseError> {
        if msg.command != "PING" {
            return Err(ServerMessageParseError::MismatchedCommand(msg));
        }

        Ok(PingMessage { raw: msg })
    }
}

impl From<PingMessage> for IrcMessage {
    fn from(msg: PingMessage) -> IrcMessage {
        msg.raw
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct PongMessage {
    pub raw: IrcMessage,
}

impl TryFrom<IrcMessage> for PongMessage {
    type Error = ServerMessageParseError;

    fn try_from(msg: IrcMessage) -> Result<PongMessage, ServerMessageParseError> {
        if msg.command != "PONG" {
            return Err(ServerMessageParseError::MismatchedCommand(msg));
        }

        Ok(PongMessage { raw: msg })
    }
}

impl From<PongMessage> for IrcMessage {
    fn from(msg: PongMessage) -> IrcMessage {
        msg.raw
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct PrivmsgMessage {
    pub channel_login: String,
    pub channel_id: String,
    pub message_text: String,
    pub reply: Option<Reply>,
    pub is_action: bool,
    pub is_first_msg: bool,
    pub is_returning_chatter: bool,
    pub is_highlighted: bool,
    pub is_mod: bool,
    pub is_subscriber: bool,
    pub sender: BasicUser,
    pub badge_info: Vec<Badge>,
    pub badges: Vec<Badge>,
    pub bits: Option<u64>,
    pub name_color: String,
    pub emotes: Vec<Emote>,
    pub message_id: String,
    pub deleted: bool,
    pub is_recent: bool,
    pub server_timestamp: u64,
    pub source_only: Option<bool>,
    pub source: Option<Source>,
    pub raw: IrcMessage,
}

impl TryFrom<IrcMessage> for PrivmsgMessage {
    type Error = ServerMessageParseError;

    fn try_from(msg: IrcMessage) -> Result<PrivmsgMessage, ServerMessageParseError> {
        if msg.command != "PRIVMSG" {
            return Err(ServerMessageParseError::MismatchedCommand(msg));
        }

        let (message_text, is_action) = msg.try_get_message_text()?;

        let msg_id = msg.try_get_tag_value("msg-id").ok();

        Ok(PrivmsgMessage {
            channel_login: msg.try_get_channel_login()?.to_owned(),
            channel_id: msg.try_get_nonempty_tag_value("room-id")?.to_owned(),
            sender: BasicUser {
                id: msg.try_get_nonempty_tag_value("user-id")?.to_owned(),
                login: msg.try_get_prefix_nickname()?.to_owned(),
                name: msg.try_get_nonempty_tag_value("display-name")?.to_owned(),
            },
            badge_info: msg.try_get_badges("badge-info")?,
            badges: msg.try_get_badges("badges")?,
            bits: msg.try_get_optional_number("bits")?,
            name_color: msg.try_get_color("color")?.to_owned(),
            emotes: msg.try_get_emotes("emotes", message_text)?,
            server_timestamp: msg.try_get_timestamp("tmi-sent-ts")?,
            message_id: msg.try_get_nonempty_tag_value("id")?.to_owned(),
            message_text: message_text.to_owned(),
            reply: msg.try_get_optional_reply()?,
            is_action,
            is_first_msg: msg.try_get_bool("first-msg").unwrap_or_default(),
            is_returning_chatter: msg.try_get_bool("returning-chatter").unwrap_or_default(),
            is_highlighted: msg_id
                .map(|id| id == "highlighted-message")
                .unwrap_or_default(),
            is_mod: msg.try_get_bool("mod")?,
            is_subscriber: msg.try_get_bool("subscriber")?,
            deleted: msg.try_get_optional_bool("rm-deleted")?.unwrap_or_default(),
            is_recent: msg.try_get_optional_bool("historical")?.unwrap_or_default(),
            source_only: msg.try_get_bool("source-only").ok(),
            source: msg.try_get_source()?,
            raw: msg,
        })
    }
}

impl From<PrivmsgMessage> for IrcMessage {
    fn from(msg: PrivmsgMessage) -> IrcMessage {
        msg.raw
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ReconnectMessage {
    pub source: IrcMessage,
}

impl TryFrom<IrcMessage> for ReconnectMessage {
    type Error = ServerMessageParseError;

    fn try_from(source: IrcMessage) -> Result<ReconnectMessage, ServerMessageParseError> {
        if source.command == "RECONNECT" {
            Ok(ReconnectMessage { source })
        } else {
            Err(MismatchedCommand(source))
        }
    }
}

impl From<ReconnectMessage> for IrcMessage {
    fn from(msg: ReconnectMessage) -> IrcMessage {
        msg.source
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct RoomStateMessage {
    pub channel_login: String,
    pub channel_id: String,
    pub emote_only: Option<bool>,
    pub followers_only: Option<FollowersOnlyMode>,
    pub r9k: Option<bool>,
    pub slow_mode: Option<Duration>,
    pub subscribers_only: Option<bool>,
    pub raw: IrcMessage,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum FollowersOnlyMode {
    Disabled,
    Enabled(Duration),
}

impl TryFrom<IrcMessage> for RoomStateMessage {
    type Error = ServerMessageParseError;

    fn try_from(msg: IrcMessage) -> Result<RoomStateMessage, ServerMessageParseError> {
        if msg.command != "ROOMSTATE" {
            return Err(ServerMessageParseError::MismatchedCommand(msg));
        }

        Ok(RoomStateMessage {
            channel_login: msg.try_get_channel_login()?.to_owned(),
            channel_id: msg.try_get_nonempty_tag_value("room-id")?.to_owned(),
            emote_only: msg.try_get_optional_bool("emote-only")?,
            followers_only: msg.try_get_optional_number::<i64>("followers-only")?.map(
                |n| match n {
                    n if n >= 0 => FollowersOnlyMode::Enabled(Duration::from_secs((n * 60) as u64)),
                    _ => FollowersOnlyMode::Disabled,
                },
            ),
            r9k: msg.try_get_optional_bool("r9k")?,
            slow_mode: msg
                .try_get_optional_number::<u64>("slow")?
                .map(Duration::from_secs),
            subscribers_only: msg.try_get_optional_bool("subs-only")?,
            raw: msg,
        })
    }
}

impl From<RoomStateMessage> for IrcMessage {
    fn from(msg: RoomStateMessage) -> IrcMessage {
        msg.raw
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct UserNoticeMessage {
    pub channel_login: String,
    pub channel_id: String,
    pub sender: BasicUser,
    pub message_text: Option<String>,
    pub system_message: String,
    pub event: UserNoticeEvent,
    pub event_id: String,
    pub badge_info: Vec<Badge>,
    pub badges: Vec<Badge>,
    pub emotes: Vec<Emote>,
    pub name_color: String,
    pub message_id: String,
    pub deleted: bool,
    pub is_recent: bool,
    pub server_timestamp: u64,
    pub source_only: Option<bool>,
    pub source: Option<Source>,
    pub raw: IrcMessage,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct SubGiftPromo {
    pub total_gifts: u64,
    pub promo_name: String,
}

impl SubGiftPromo {
    fn parse_if_present(msg: &IrcMessage) -> Result<Option<SubGiftPromo>, ServerMessageParseError> {
        if let (Some(total_gifts), Some(promo_name)) = (
            msg.try_get_optional_number("msg-param-promo-gift-total")?,
            msg.try_get_optional_nonempty_tag_value("msg-param-promo-name")?
                .map(|s| s.to_owned()),
        ) {
            Ok(Some(SubGiftPromo {
                total_gifts,
                promo_name,
            }))
        } else {
            Ok(None)
        }
    }
}

#[non_exhaustive]
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(tag = "type", rename_all(serialize = "snake_case"))]
pub enum UserNoticeEvent {
    Announcement {
        color: String,
    },
    SubOrResub {
        is_resub: bool,
        cumulative_months: u64,
        streak_months: Option<u64>,
        sub_plan: String,
        sub_plan_name: String,
    },
    Raid {
        viewer_count: u64,
        profile_image_url: String,
    },
    SubGift {
        is_sender_anonymous: bool,
        cumulative_months: u64,
        recipient: BasicUser,
        sub_plan: String,
        sub_plan_name: String,
        num_gifted_months: u64,
        sender_total_months: u64,
    },
    SubMysteryGift {
        mass_gift_count: u64,
        sender_total_gifts: Option<u64>,
        sub_plan: String,
    },
    AnonSubMysteryGift {
        mass_gift_count: u64,
        sub_plan: String,
    },
    GiftPaidUpgrade {
        gifter_login: String,
        gifter_name: String,
        promotion: Option<SubGiftPromo>,
    },
    AnonGiftPaidUpgrade {
        promotion: Option<SubGiftPromo>,
    },
    Ritual {
        ritual_name: String,
    },
    BitsBadgeTier {
        threshold: u64,
    },
    Unknown,
}

impl TryFrom<IrcMessage> for UserNoticeMessage {
    type Error = ServerMessageParseError;

    fn try_from(msg: IrcMessage) -> Result<UserNoticeMessage, ServerMessageParseError> {
        if msg.command != "USERNOTICE" {
            return Err(ServerMessageParseError::MismatchedCommand(msg));
        }

        let sender = BasicUser {
            id: msg.try_get_nonempty_tag_value("user-id")?.to_owned(),
            login: msg.try_get_nonempty_tag_value("login")?.to_owned(),
            name: msg.try_get_nonempty_tag_value("display-name")?.to_owned(),
        };

        let event_id = msg.try_get_nonempty_tag_value("msg-id")?.to_owned();

        let event = match event_id.as_str() {
            "announcement" => UserNoticeEvent::Announcement {
                color: msg
                    .try_get_nonempty_tag_value("msg-param-color")?
                    .to_owned(),
            },
            "sub" | "resub" => UserNoticeEvent::SubOrResub {
                is_resub: event_id == "resub",
                cumulative_months: msg.try_get_number("msg-param-cumulative-months")?,
                streak_months: if msg.try_get_bool("msg-param-should-share-streak")? {
                    Some(msg.try_get_number("msg-param-streak-months")?)
                } else {
                    None
                },
                sub_plan: msg
                    .try_get_nonempty_tag_value("msg-param-sub-plan")?
                    .to_owned(),
                sub_plan_name: msg
                    .try_get_nonempty_tag_value("msg-param-sub-plan-name")?
                    .to_owned(),
            },
            "raid" => UserNoticeEvent::Raid {
                viewer_count: msg.try_get_number::<u64>("msg-param-viewerCount")?,
                profile_image_url: msg
                    .try_get_nonempty_tag_value("msg-param-profileImageURL")?
                    .to_owned(),
            },
            "subgift" | "anonsubgift" => UserNoticeEvent::SubGift {
                is_sender_anonymous: event_id == "anonsubgift" || sender.id == "274598607",
                cumulative_months: msg.try_get_number("msg-param-months")?,
                recipient: BasicUser {
                    id: msg
                        .try_get_nonempty_tag_value("msg-param-recipient-id")?
                        .to_owned(),
                    login: msg
                        .try_get_nonempty_tag_value("msg-param-recipient-user-name")?
                        .to_owned(),
                    name: msg
                        .try_get_nonempty_tag_value("msg-param-recipient-display-name")?
                        .to_owned(),
                },
                sub_plan: msg
                    .try_get_nonempty_tag_value("msg-param-sub-plan")?
                    .to_owned(),
                sub_plan_name: msg
                    .try_get_nonempty_tag_value("msg-param-sub-plan-name")?
                    .to_owned(),
                num_gifted_months: msg.try_get_number("msg-param-gift-months")?,
                sender_total_months: msg
                    .try_get_optional_number("msg-param-sender-count")?
                    .unwrap_or_default(),
            },
            _ if (sender.id == "274598607" && event_id == "submysterygift")
                || event_id == "anonsubmysterygift" =>
            {
                UserNoticeEvent::AnonSubMysteryGift {
                    mass_gift_count: msg.try_get_number("msg-param-mass-gift-count")?,
                    sub_plan: msg
                        .try_get_nonempty_tag_value("msg-param-sub-plan")?
                        .to_owned(),
                }
            }
            "submysterygift" => UserNoticeEvent::SubMysteryGift {
                mass_gift_count: msg.try_get_number("msg-param-mass-gift-count")?,
                sender_total_gifts: if sender.login != "twitch" {
                    Some(msg.try_get_number("msg-param-sender-count")?)
                } else {
                    msg.try_get_number("msg-param-sender-count").ok()
                },
                sub_plan: msg
                    .try_get_nonempty_tag_value("msg-param-sub-plan")?
                    .to_owned(),
            },

            "giftpaidupgrade" => UserNoticeEvent::GiftPaidUpgrade {
                gifter_login: msg
                    .try_get_nonempty_tag_value("msg-param-sender-login")?
                    .to_owned(),
                gifter_name: msg
                    .try_get_nonempty_tag_value("msg-param-sender-name")?
                    .to_owned(),
                promotion: SubGiftPromo::parse_if_present(&msg)?,
            },
            "anongiftpaidupgrade" => UserNoticeEvent::AnonGiftPaidUpgrade {
                promotion: SubGiftPromo::parse_if_present(&msg)?,
            },
            "ritual" => UserNoticeEvent::Ritual {
                ritual_name: msg
                    .try_get_nonempty_tag_value("msg-param-ritual-name")?
                    .to_owned(),
            },
            "bitsbadgetier" => UserNoticeEvent::BitsBadgeTier {
                threshold: msg.try_get_number::<u64>("msg-param-threshold")?.to_owned(),
            },
            _ => UserNoticeEvent::Unknown,
        };

        let message_text = msg.params.get(1).cloned();

        let emotes = if let Some(message_text) = &message_text {
            msg.try_get_emotes("emotes", message_text)?
        } else {
            vec![]
        };

        let system_message = msg
            .try_get_nonempty_tag_value("system-msg")
            .or_else(|e| {
                if event_id == "announcement" {
                    msg.try_get_param(1)
                } else {
                    Err(e)
                }
            })?
            .to_owned();

        Ok(UserNoticeMessage {
            channel_login: msg.try_get_channel_login()?.to_owned(),
            channel_id: msg.try_get_nonempty_tag_value("room-id")?.to_owned(),
            sender,
            message_text,
            system_message,
            event,
            event_id,
            badge_info: msg.try_get_badges("badge-info")?,
            badges: msg.try_get_badges("badges")?,
            emotes,
            name_color: msg.try_get_color("color")?.to_owned(),
            message_id: msg.try_get_nonempty_tag_value("id")?.to_owned(),
            deleted: msg.try_get_optional_bool("rm-deleted")?.unwrap_or_default(),
            is_recent: msg.try_get_optional_bool("historical")?.unwrap_or_default(),
            server_timestamp: msg.try_get_timestamp("tmi-sent-ts")?.to_owned(),
            source_only: msg.try_get_bool("source-only").ok(),
            source: msg.try_get_source()?,
            raw: msg,
        })
    }
}

impl From<UserNoticeMessage> for IrcMessage {
    fn from(msg: UserNoticeMessage) -> IrcMessage {
        msg.raw
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct UserStateMessage {
    pub channel_login: String,
    pub user_name: String,
    pub badge_info: Vec<Badge>,
    pub badges: Vec<Badge>,
    pub emote_sets: HashSet<String>,
    pub name_color: String,
    pub raw: IrcMessage,
}

impl TryFrom<IrcMessage> for UserStateMessage {
    type Error = ServerMessageParseError;

    fn try_from(msg: IrcMessage) -> Result<UserStateMessage, ServerMessageParseError> {
        if msg.command != "USERSTATE" {
            return Err(ServerMessageParseError::MismatchedCommand(msg));
        }

        Ok(UserStateMessage {
            channel_login: msg.try_get_channel_login()?.to_owned(),
            user_name: msg.try_get_nonempty_tag_value("display-name")?.to_owned(),
            badge_info: msg.try_get_badges("badge-info")?,
            badges: msg.try_get_badges("badges")?,
            emote_sets: msg.try_get_emote_sets("emote-sets")?,
            name_color: msg.try_get_color("color")?.to_owned(),
            raw: msg,
        })
    }
}

impl From<UserStateMessage> for IrcMessage {
    fn from(msg: UserStateMessage) -> IrcMessage {
        msg.raw
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct WhisperMessage {
    pub recipient_login: String,
    pub sender: BasicUser,
    pub message_text: String,
    pub name_color: String,
    pub badges: Vec<Badge>,
    pub emotes: Vec<Emote>,
    pub raw: IrcMessage,
}

impl TryFrom<IrcMessage> for WhisperMessage {
    type Error = ServerMessageParseError;

    fn try_from(msg: IrcMessage) -> Result<WhisperMessage, ServerMessageParseError> {
        if msg.command != "WHISPER" {
            return Err(ServerMessageParseError::MismatchedCommand(msg));
        }

        let message_text = msg.try_get_param(1)?.to_owned();
        let emotes = msg.try_get_emotes("emotes", &message_text)?;

        Ok(WhisperMessage {
            recipient_login: msg.try_get_param(0)?.to_owned(),
            sender: BasicUser {
                id: msg.try_get_nonempty_tag_value("user-id")?.to_owned(),
                login: msg.try_get_prefix_nickname()?.to_owned(),
                name: msg.try_get_nonempty_tag_value("display-name")?.to_owned(),
            },
            message_text,
            name_color: msg.try_get_color("color")?.to_owned(),
            badges: msg.try_get_badges("badges")?,
            emotes,
            raw: msg,
        })
    }
}

impl From<WhisperMessage> for IrcMessage {
    fn from(msg: WhisperMessage) -> IrcMessage {
        msg.raw
    }
}

#[derive(Error, Debug, PartialEq, Eq)]
pub enum ServerMessageParseError {
    #[error("Could not parse IRC message {} as ServerMessage: That command's data is not parsed by this implementation", .0.as_raw_irc())]
    MismatchedCommand(IrcMessage),

    #[error("Could not parse IRC message {raw} as ServerMessage: No tag present under key `{1}`", raw = .0.as_raw_irc())]
    MissingTag(IrcMessage, &'static str),

    #[error("Could not parse IRC message {raw} as ServerMessage: No tag value present under key `{1}`", raw = .0.as_raw_irc())]
    MissingTagValue(IrcMessage, &'static str),

    #[error("Could not parse IRC message {raw} as ServerMessage: Malformed tag value for tag `{1}`, value was `{2}`", raw = .0.as_raw_irc())]
    MalformedTagValue(IrcMessage, &'static str, String),

    #[error("Could not parse IRC message {raw} as ServerMessage: No parameter found at index {1}", raw = .0.as_raw_irc())]
    MissingParameter(IrcMessage, usize),

    #[error("Could not parse IRC message {raw} as ServerMessage: Malformed channel parameter (# must be present + something after it)", raw = .0.as_raw_irc())]
    MalformedChannel(IrcMessage),

    #[error("Could not parse IRC message {} as ServerMessage: Missing prefix altogether", .0.as_raw_irc())]
    MissingPrefix(IrcMessage),

    #[error("Could not parse IRC message {} as ServerMessage: No nickname found in prefix", .0.as_raw_irc())]
    MissingNickname(IrcMessage),
}

impl From<ServerMessageParseError> for IrcMessage {
    fn from(msg: ServerMessageParseError) -> IrcMessage {
        match msg {
            ServerMessageParseError::MismatchedCommand(m) => m,
            ServerMessageParseError::MissingTag(m, _) => m,
            ServerMessageParseError::MissingTagValue(m, _) => m,
            ServerMessageParseError::MalformedTagValue(m, _, _) => m,
            ServerMessageParseError::MissingParameter(m, _) => m,
            ServerMessageParseError::MalformedChannel(m) => m,
            ServerMessageParseError::MissingPrefix(m) => m,
            ServerMessageParseError::MissingNickname(m) => m,
        }
    }
}

trait IrcMessageParseExt {
    fn try_get_param(&self, index: usize) -> Result<&str, ServerMessageParseError>;
    fn try_get_message_text(&self) -> Result<(&str, bool), ServerMessageParseError>;
    fn try_get_tag_value(&self, key: &'static str) -> Result<&str, ServerMessageParseError>;
    fn try_get_nonempty_tag_value(
        &self,
        key: &'static str,
    ) -> Result<&str, ServerMessageParseError>;
    fn try_get_optional_nonempty_tag_value(
        &self,
        key: &'static str,
    ) -> Result<Option<&str>, ServerMessageParseError>;
    fn try_get_channel_login(&self) -> Result<&str, ServerMessageParseError>;
    fn try_get_optional_channel_login(&self) -> Result<Option<&str>, ServerMessageParseError>;
    fn try_get_prefix_nickname(&self) -> Result<&str, ServerMessageParseError>;
    fn try_get_emotes(
        &self,
        tag_key: &'static str,
        message_text: &str,
    ) -> Result<Vec<Emote>, ServerMessageParseError>;
    fn try_get_emote_sets(
        &self,
        tag_key: &'static str,
    ) -> Result<HashSet<String>, ServerMessageParseError>;
    fn try_get_badges(&self, tag_key: &'static str) -> Result<Vec<Badge>, ServerMessageParseError>;
    fn try_get_color(&self, tag_key: &'static str) -> Result<&str, ServerMessageParseError>;
    fn try_get_number<N: FromStr>(
        &self,
        tag_key: &'static str,
    ) -> Result<N, ServerMessageParseError>;
    fn try_get_bool(&self, tag_key: &'static str) -> Result<bool, ServerMessageParseError>;
    fn try_get_optional_number<N: FromStr>(
        &self,
        tag_key: &'static str,
    ) -> Result<Option<N>, ServerMessageParseError>;
    fn try_get_optional_bool(
        &self,
        tag_key: &'static str,
    ) -> Result<Option<bool>, ServerMessageParseError>;
    fn try_get_timestamp(&self, tag_key: &'static str) -> Result<u64, ServerMessageParseError>;
    fn try_get_optional_reply(&self) -> Result<Option<Reply>, ServerMessageParseError>;
    fn try_get_source(&self) -> Result<Option<Source>, ServerMessageParseError>;
}

impl IrcMessageParseExt for IrcMessage {
    fn try_get_param(&self, index: usize) -> Result<&str, ServerMessageParseError> {
        Ok(self
            .params
            .get(index)
            .ok_or_else(|| MissingParameter(self.to_owned(), index))?)
    }

    fn try_get_message_text(&self) -> Result<(&str, bool), ServerMessageParseError> {
        let mut message_text = self.try_get_param(1)?;

        let is_action =
            message_text.starts_with("\u{0001}ACTION ") && message_text.ends_with('\u{0001}');
        if is_action {
            // remove the prefix and suffix
            message_text = &message_text[8..message_text.len() - 1]
        }

        Ok((message_text, is_action))
    }

    fn try_get_tag_value(&self, key: &'static str) -> Result<&str, ServerMessageParseError> {
        match self.tags.0.get(key) {
            Some(value) => Ok(value),
            None => Err(MissingTag(self.to_owned(), key)),
        }
    }

    fn try_get_nonempty_tag_value(
        &self,
        key: &'static str,
    ) -> Result<&str, ServerMessageParseError> {
        match self.tags.0.get(key) {
            Some(value) => match value.as_str() {
                "" => Err(MissingTagValue(self.to_owned(), key)),
                otherwise => Ok(otherwise),
            },
            None => Err(MissingTag(self.to_owned(), key)),
        }
    }

    fn try_get_optional_nonempty_tag_value(
        &self,
        key: &'static str,
    ) -> Result<Option<&str>, ServerMessageParseError> {
        match self.tags.0.get(key) {
            Some(value) => match value.as_str() {
                "" => Err(MissingTagValue(self.to_owned(), key)),
                otherwise => Ok(Some(otherwise)),
            },
            None => Ok(None),
        }
    }

    fn try_get_channel_login(&self) -> Result<&str, ServerMessageParseError> {
        let param = self.try_get_param(0)?;

        if !param.starts_with('#') || param.len() < 2 {
            return Err(MalformedChannel(self.to_owned()));
        }

        Ok(&param[1..])
    }

    fn try_get_optional_channel_login(&self) -> Result<Option<&str>, ServerMessageParseError> {
        let param = self.try_get_param(0)?;

        if param == "*" {
            return Ok(None);
        }

        if !param.starts_with('#') || param.len() < 2 {
            return Err(MalformedChannel(self.to_owned()));
        }

        Ok(Some(&param[1..]))
    }

    fn try_get_prefix_nickname(&self) -> Result<&str, ServerMessageParseError> {
        match &self.prefix {
            None => Err(MissingPrefix(self.to_owned())),
            Some(IrcPrefix::HostOnly { host: _ }) => Err(MissingNickname(self.to_owned())),
            Some(IrcPrefix::Full {
                nick,
                user: _,
                host: _,
            }) => Ok(nick),
        }
    }

    fn try_get_emotes(
        &self,
        tag_key: &'static str,
        message_text: &str,
    ) -> Result<Vec<Emote>, ServerMessageParseError> {
        let tag_value = self.try_get_tag_value(tag_key)?;

        if tag_value.is_empty() {
            return Ok(vec![]);
        }

        let mut emotes = Vec::new();

        let make_error = || MalformedTagValue(self.to_owned(), tag_key, tag_value.to_owned());

        for src in tag_value.split('/') {
            let (emote_id, indices_src) = src.split_once(':').ok_or_else(make_error)?;

            for range_src in indices_src.split(',') {
                let (start, end) = range_src.split_once('-').ok_or_else(make_error)?;

                let start = usize::from_str(start).map_err(|_| make_error())?;
                let end = usize::from_str(end).map_err(|_| make_error())? + 1;

                let code_length = end - start;

                let code = message_text
                    .chars()
                    .skip(start)
                    .take(code_length)
                    .collect::<String>();

                emotes.push(Emote {
                    id: emote_id.to_owned(),
                    range: start..end,
                    code,
                });
            }
        }

        emotes.sort_unstable_by_key(|e| e.range.start);

        Ok(emotes)
    }

    fn try_get_emote_sets(
        &self,
        tag_key: &'static str,
    ) -> Result<HashSet<String>, ServerMessageParseError> {
        let src = self.try_get_tag_value(tag_key)?;

        if src.is_empty() {
            Ok(HashSet::new())
        } else {
            Ok(src.split(',').map(|s| s.to_owned()).collect())
        }
    }

    fn try_get_badges(&self, tag_key: &'static str) -> Result<Vec<Badge>, ServerMessageParseError> {
        // TODO same thing as above, could be optimized to not clone the tag value as well
        let tag_value = self.try_get_tag_value(tag_key)?;

        if tag_value.is_empty() {
            return Ok(vec![]);
        }

        let mut badges = Vec::new();

        let make_error = || MalformedTagValue(self.to_owned(), tag_key, tag_value.to_owned());

        for src in tag_value.split(',') {
            let (name, version) = src.split_once('/').ok_or_else(make_error)?;

            badges.push(Badge {
                name: name.to_owned(),
                version: version.to_owned(),
            });
        }

        Ok(badges)
    }

    fn try_get_color(&self, tag_key: &'static str) -> Result<&str, ServerMessageParseError> {
        let tag_value = self.try_get_tag_value(tag_key)?;
        Ok(tag_value)
    }

    fn try_get_number<N: FromStr>(
        &self,
        tag_key: &'static str,
    ) -> Result<N, ServerMessageParseError> {
        let tag_value = self.try_get_nonempty_tag_value(tag_key)?;
        let number = N::from_str(tag_value)
            .map_err(|_| MalformedTagValue(self.to_owned(), tag_key, tag_value.to_owned()))?;
        Ok(number)
    }

    fn try_get_bool(&self, tag_key: &'static str) -> Result<bool, ServerMessageParseError> {
        Ok(self.try_get_number::<u8>(tag_key)? > 0)
    }

    fn try_get_optional_number<N: FromStr>(
        &self,
        tag_key: &'static str,
    ) -> Result<Option<N>, ServerMessageParseError> {
        let tag_value = match self.tags.0.get(tag_key) {
            Some(value) => match value.as_str() {
                "" => return Err(MissingTagValue(self.to_owned(), tag_key)),
                otherwise => otherwise,
            },
            None => return Ok(None),
        };

        let number = N::from_str(tag_value)
            .map_err(|_| MalformedTagValue(self.to_owned(), tag_key, tag_value.to_owned()))?;
        Ok(Some(number))
    }

    fn try_get_optional_bool(
        &self,
        tag_key: &'static str,
    ) -> Result<Option<bool>, ServerMessageParseError> {
        Ok(self.try_get_optional_number::<u8>(tag_key)?.map(|n| n > 0))
    }

    fn try_get_timestamp(&self, tag_key: &'static str) -> Result<u64, ServerMessageParseError> {
        let tag_value = self.try_get_nonempty_tag_value(tag_key)?;
        let milliseconds_since_epoch = u64::from_str(tag_value)
            .map_err(|_| MalformedTagValue(self.to_owned(), tag_key, tag_value.to_owned()))?;

        Ok(milliseconds_since_epoch)
    }

    fn try_get_optional_reply(&self) -> Result<Option<Reply>, ServerMessageParseError> {
        if !self.tags.0.contains_key("reply-parent-msg-id") {
            return Ok(None);
        }

        let parent = ReplyParent {
            message_id: self.try_get_tag_value("reply-parent-msg-id")?.to_owned(),
            user: BasicUser {
                id: self
                    .try_get_nonempty_tag_value("reply-parent-user-id")?
                    .to_owned(),
                login: self
                    .try_get_nonempty_tag_value("reply-parent-user-login")?
                    .to_owned(),
                name: self
                    .try_get_nonempty_tag_value("reply-parent-display-name")?
                    .to_owned(),
            },
            message_text: self.try_get_tag_value("reply-parent-msg-body")?.to_owned(),
        };

        let thread = ReplyThread {
            message_id: self
                .try_get_tag_value("reply-thread-parent-msg-id")?
                .to_owned(),
            user: BasicUser {
                id: self
                    .try_get_nonempty_tag_value("reply-thread-parent-user-id")?
                    .to_owned(),
                login: self
                    .try_get_nonempty_tag_value("reply-thread-parent-user-login")?
                    .to_owned(),
                name: self
                    .try_get_nonempty_tag_value("reply-thread-parent-display-name")?
                    .to_owned(),
            },
        };

        Ok(Some(Reply { parent, thread }))
    }

    fn try_get_source(&self) -> Result<Option<Source>, ServerMessageParseError> {
        if !self.tags.0.contains_key("source-id") {
            return Ok(None);
        }

        Ok(Some(Source {
            message_id: self.try_get_nonempty_tag_value("source-id")?.to_owned(),
            event_id: self
                .try_get_tag_value("source-msg-id")
                .ok()
                .map(|s| s.to_owned()),
            channel_id: self
                .try_get_nonempty_tag_value("source-room-id")?
                .to_owned(),
            badges: self.try_get_badges("source-badges").unwrap_or_default(),
            badge_info: self.try_get_badges("source-badge-info").unwrap_or_default(),
        }))
    }
}

#[derive(Debug, PartialEq, Eq, Clone, Serialize, Deserialize)]
pub struct HiddenIrcMessage(pub(self) IrcMessage);

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", rename_all(serialize = "lowercase"))]
#[non_exhaustive]
pub enum ServerMessage {
    ClearChat(ClearChatMessage),
    ClearMsg(ClearMsgMessage),
    GlobalUserState(GlobalUserStateMessage),
    Join(JoinMessage),
    Notice(NoticeMessage),
    Part(PartMessage),
    Ping(PingMessage),
    Pong(PongMessage),
    Privmsg(PrivmsgMessage),
    Reconnect(ReconnectMessage),
    RoomState(RoomStateMessage),
    UserNotice(UserNoticeMessage),
    UserState(UserStateMessage),
    Whisper(WhisperMessage),
    Generic(HiddenIrcMessage),
}

impl TryFrom<IrcMessage> for ServerMessage {
    type Error = ServerMessageParseError;

    fn try_from(source: IrcMessage) -> Result<ServerMessage, ServerMessageParseError> {
        use ServerMessage::*;

        Ok(match source.command.as_str() {
            "CLEARCHAT" => ClearChat(ClearChatMessage::try_from(source)?),
            "CLEARMSG" => ClearMsg(ClearMsgMessage::try_from(source)?),
            "GLOBALUSERSTATE" => GlobalUserState(GlobalUserStateMessage::try_from(source)?),
            "JOIN" => Join(JoinMessage::try_from(source)?),
            "NOTICE" => Notice(NoticeMessage::try_from(source)?),
            "PART" => Part(PartMessage::try_from(source)?),
            "PING" => Ping(PingMessage::try_from(source)?),
            "PONG" => Pong(PongMessage::try_from(source)?),
            "PRIVMSG" => Privmsg(PrivmsgMessage::try_from(source)?),
            "RECONNECT" => Reconnect(ReconnectMessage::try_from(source)?),
            "ROOMSTATE" => RoomState(RoomStateMessage::try_from(source)?),
            "USERNOTICE" => UserNotice(UserNoticeMessage::try_from(source)?),
            "USERSTATE" => UserState(UserStateMessage::try_from(source)?),
            "WHISPER" => Whisper(WhisperMessage::try_from(source)?),
            _ => Generic(HiddenIrcMessage(source)),
        })
    }
}

impl From<ServerMessage> for IrcMessage {
    fn from(msg: ServerMessage) -> IrcMessage {
        match msg {
            ServerMessage::ClearChat(msg) => msg.raw,
            ServerMessage::ClearMsg(msg) => msg.raw,
            ServerMessage::GlobalUserState(msg) => msg.raw,
            ServerMessage::Join(msg) => msg.raw,
            ServerMessage::Notice(msg) => msg.raw,
            ServerMessage::Part(msg) => msg.raw,
            ServerMessage::Ping(msg) => msg.raw,
            ServerMessage::Pong(msg) => msg.raw,
            ServerMessage::Privmsg(msg) => msg.raw,
            ServerMessage::Reconnect(msg) => msg.source,
            ServerMessage::RoomState(msg) => msg.raw,
            ServerMessage::UserNotice(msg) => msg.raw,
            ServerMessage::UserState(msg) => msg.raw,
            ServerMessage::Whisper(msg) => msg.raw,
            ServerMessage::Generic(msg) => msg.0,
        }
    }
}

impl ServerMessage {
    pub fn source(&self) -> &IrcMessage {
        match self {
            ServerMessage::ClearChat(msg) => &msg.raw,
            ServerMessage::ClearMsg(msg) => &msg.raw,
            ServerMessage::GlobalUserState(msg) => &msg.raw,
            ServerMessage::Join(msg) => &msg.raw,
            ServerMessage::Notice(msg) => &msg.raw,
            ServerMessage::Part(msg) => &msg.raw,
            ServerMessage::Ping(msg) => &msg.raw,
            ServerMessage::Pong(msg) => &msg.raw,
            ServerMessage::Privmsg(msg) => &msg.raw,
            ServerMessage::Reconnect(msg) => &msg.source,
            ServerMessage::RoomState(msg) => &msg.raw,
            ServerMessage::UserNotice(msg) => &msg.raw,
            ServerMessage::UserState(msg) => &msg.raw,
            ServerMessage::Whisper(msg) => &msg.raw,
            ServerMessage::Generic(msg) => &msg.0,
        }
    }

    pub(crate) fn new_generic(message: IrcMessage) -> ServerMessage {
        ServerMessage::Generic(HiddenIrcMessage(message))
    }
}

impl AsRawIrc for ServerMessage {
    fn format_as_raw_irc(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        self.source().format_as_raw_irc(f)
    }
}
