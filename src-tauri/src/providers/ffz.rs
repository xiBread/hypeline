use std::collections::HashMap;

use anyhow::Result;
use serde::Deserialize;

use crate::emotes;

const BASE_URL: &str = "https://api.frankerfacez.com/v1";

#[derive(Deserialize)]
pub struct Room {
    pub room: RoomInner,
    pub sets: HashMap<u32, EmoteSet>,
}

#[derive(Deserialize)]
pub struct RoomInner {
    pub set: u32,
}

#[derive(Deserialize)]
pub struct GlobalSet {
    pub default_sets: Vec<u32>,
    pub sets: HashMap<u32, EmoteSet>,
}

#[derive(Deserialize)]
pub struct EmoteSet {
    pub emoticons: Vec<Emote>,
}

#[derive(Deserialize, Clone)]
pub struct Emote {
    pub id: u32,
    pub name: String,
    pub height: u32,
    pub width: u32,
    pub urls: HashMap<String, String>,
}

fn parse_emote(emote: &Emote) -> emotes::Emote {
    let name = emote.name.to_string();

    let url = emote
        .urls
        .get("4")
        .or_else(|| emote.urls.get("2").or_else(|| emote.urls.get("1")))
        .expect("missing url")
        .to_string();

    emotes::Emote {
        id: emote.id.to_string(),
        name: name.clone(),
        url,
        width: emote.width,
        height: emote.height,
    }
}

pub async fn fetch_global_emotes() -> Result<Vec<emotes::Emote>> {
    let global_set: GlobalSet = reqwest::get(format!("{BASE_URL}/set/global"))
        .await?
        .json()
        .await?;

    let mut emotes = Vec::new();

    for (id, emote_set) in global_set.sets {
        if global_set.default_sets.contains(&id) {
            emotes.extend(emote_set.emoticons.iter().map(parse_emote));
        }
    }

    Ok(emotes)
}

pub async fn fetch_user_emotes(id: &str) -> Result<Vec<emotes::Emote>> {
    let response = reqwest::get(format!("{BASE_URL}/room/id/{id}")).await?;
    let mut emotes = Vec::new();

    if !response.status().is_success() {
        return Ok(emotes);
    }

    let room = response.json::<Room>().await?;

    if let Some(emote_set) = room.sets.get(&room.room.set) {
        emotes.extend(emote_set.emoticons.iter().map(parse_emote));
    }

    Ok(emotes)
}
