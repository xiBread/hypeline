use std::collections::HashMap;

use anyhow::Result;
use serde::Deserialize;

use crate::emotes::Emote;
use crate::HTTP;

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
    pub emoticons: Vec<ApiEmote>,
}

#[derive(Deserialize, Clone)]
pub struct ApiEmote {
    pub id: u32,
    pub name: String,
    pub height: u32,
    pub width: u32,
    pub urls: HashMap<String, String>,
}

impl From<&ApiEmote> for Emote {
    fn from(value: &ApiEmote) -> Self {
        let name = value.name.to_string();

        Emote {
            id: value.id.to_string(),
            name: name.clone(),
            width: value.width,
            height: value.height,
            srcset: value
                .urls
                .iter()
                .map(|(density, url)| format!("{url} {density}x"))
                .collect(),
        }
    }
}

pub async fn fetch_global_emotes() -> Result<Vec<Emote>> {
    let global_set: GlobalSet = HTTP
        .get(format!("{BASE_URL}/set/global"))
        .send()
        .await?
        .json()
        .await?;

    let mut emotes = Vec::new();

    for (id, emote_set) in global_set.sets {
        if global_set.default_sets.contains(&id) {
            emotes.extend(emote_set.emoticons.iter().map(|e| e.into()));
        }
    }

    Ok(emotes)
}

pub async fn fetch_user_emotes(id: &str) -> Result<Vec<Emote>> {
    let response = HTTP.get(format!("{BASE_URL}/room/id/{id}")).send().await?;
    let mut emotes = Vec::new();

    if !response.status().is_success() {
        return Ok(emotes);
    }

    let room = response.json::<Room>().await?;

    if let Some(emote_set) = room.sets.get(&room.room.set) {
        emotes.extend(emote_set.emoticons.clone().iter().map(|e| e.into()));
    }

    Ok(emotes)
}
