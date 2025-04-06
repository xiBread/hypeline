use std::collections::HashMap;

use anyhow::Result;
use serde::Deserialize;

use crate::emotes::{self, EmoteMap};

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

pub async fn fetch_emotes(id: &str) -> Result<EmoteMap> {
    let mut all_emotes = fetch_global_emotes().await?;
    let user_emotes = fetch_user_emotes(id).await?;

    all_emotes.extend(user_emotes);

    let mut emotes = HashMap::new();

    for emote in all_emotes {
        let name = emote.code;
        let url = format!("{CDN_URL}/{}/3x", emote.id);

        let emote = emotes::Emote {
            id: emote.id,
            name: name.clone(),
            url,
            width: emote.width.unwrap_or(28),
            height: emote.height.unwrap_or(28),
        };

        emotes.insert(name, emote);
    }

    Ok(emotes)
}

async fn fetch_global_emotes() -> Result<Vec<Emote>> {
    let emotes = reqwest::get(format!("{BASE_URL}/emotes/global"))
        .await?
        .json::<Vec<Emote>>()
        .await?;

    Ok(emotes)
}

async fn fetch_user_emotes(id: &str) -> Result<Vec<Emote>> {
    let user = reqwest::get(format!("{BASE_URL}/users/twitch/{id}"))
        .await?
        .json::<User>()
        .await?;

    let emotes = user
        .channel_emotes
        .into_iter()
        .chain(user.shared_emotes.into_iter())
        .collect();

    Ok(emotes)
}
