use anyhow::Result;
use serde::{Deserialize, Serialize};

use crate::error::Error;
use crate::{emotes, HTTP};

const BASE_URL: &str = "https://7tv.io/v3";

#[derive(Deserialize)]

pub struct User {
    pub emote_set: Option<EmoteSet>,
}

#[derive(Serialize, Deserialize)]

pub struct EmoteSet {
    pub id: String,
    pub name: String,
    pub emotes: Vec<Emote>,
}

#[derive(Clone, Serialize, Deserialize)]

pub struct Emote {
    pub id: String,
    pub name: String,
    pub data: EmoteData,
}

#[derive(Clone, Serialize, Deserialize)]

pub struct EmoteData {
    pub host: EmoteHost,
}

#[derive(Clone, Serialize, Deserialize)]

pub struct EmoteHost {
    pub url: String,
    pub files: Vec<EmoteHostFile>,
}

#[derive(Clone, Serialize, Deserialize)]
pub struct EmoteHostFile {
    pub name: String,
    pub width: u32,
    pub height: u32,
    pub format: String,
}

pub fn parse_emote(emote: Emote) -> Option<emotes::Emote> {
    let host = emote.data.host;

    let files: Vec<&_> = host
        .files
        .iter()
        .filter(|file| file.name.starts_with("4x"))
        .collect();

    if files.is_empty() {
        return None;
    }

    let priority = |format: &str| match format.to_lowercase().as_str() {
        // Animated AVIFs are broken
        // "avif" => Some(0),
        "webp" => Some(1),
        "png" => Some(2),
        "gif" => Some(3),
        _ => None,
    };

    let mut best_priority: Option<usize> = None;
    let mut best_file: Option<&_> = None;

    for file in files {
        if let Some(p) = priority(&file.format) {
            if best_priority.is_none() || p < best_priority.unwrap() {
                best_priority = Some(p);
                best_file = Some(file);
            }
        }
    }

    if let Some(file) = best_file {
        let new_emote = emotes::Emote {
            id: emote.id,
            name: emote.name,
            url: format!("https:{}/{}", host.url, file.name),
            width: file.width / 4,
            height: file.height / 4,
        };

        return Some(new_emote);
    }

    None
}

pub async fn fetch_global_emotes() -> Result<Vec<emotes::Emote>> {
    let global_set: EmoteSet = HTTP
        .get(format!("{BASE_URL}/emote-sets/global"))
        .send()
        .await?
        .json()
        .await?;

    let emotes = global_set
        .emotes
        .into_iter()
        .filter_map(parse_emote)
        .collect();

    Ok(emotes)
}

pub async fn fetch_active_emote_set(id: &str) -> Result<Option<EmoteSet>, Error> {
    let user: User = HTTP
        .get(format!("{BASE_URL}/users/twitch/{id}"))
        .send()
        .await?
        .json()
        .await?;

    Ok(user.emote_set)
}
