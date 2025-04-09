use anyhow::Result;
use serde::Deserialize;

use crate::emotes;

const BASE_URL: &str = "https://api.betterttv.net/3/cached";
const CDN_URL: &str = "https://cdn.betterttv.net/emote";

#[derive(Deserialize)]
pub struct User {
    #[serde(rename = "channelEmotes")]
    pub channel_emotes: Vec<Emote>,

    #[serde(rename = "sharedEmotes")]
    pub shared_emotes: Vec<Emote>,
}

#[derive(Deserialize)]
pub struct Emote {
    pub id: String,
    pub code: String,
    pub width: Option<u32>,
    pub height: Option<u32>,
}

pub fn parse_emote(emote: Emote) -> emotes::Emote {
    let url = format!("{CDN_URL}/{}/3x", emote.id);

    emotes::Emote {
        id: emote.id,
        name: emote.code,
        url,
        width: emote.width.unwrap_or(28),
        height: emote.height.unwrap_or(28),
    }
}

pub async fn fetch_global_emotes() -> Result<Vec<emotes::Emote>> {
    let emotes: Vec<Emote> = reqwest::get(format!("{BASE_URL}/emotes/global"))
        .await?
        .json()
        .await?;

    let emotes: Vec<_> = emotes.into_iter().map(parse_emote).collect();
    Ok(emotes)
}

pub async fn fetch_user_emotes(id: &str) -> Result<Vec<emotes::Emote>> {
    let user: User = reqwest::get(format!("{BASE_URL}/users/twitch/{id}"))
        .await?
        .json()
        .await?;

    let emotes: Vec<_> = user
        .channel_emotes
        .into_iter()
        .chain(user.shared_emotes.into_iter())
        .map(parse_emote)
        .collect();

    Ok(emotes)
}
