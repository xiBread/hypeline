use std::collections::HashMap;

use anyhow::Result;
use serde::Deserialize;

use crate::emotes::{self, EmoteMap};

const BASE_URL: &str = "https://7tv.io/v3";

#[derive(Deserialize)]

pub struct User {
    pub emote_set: EmoteSet,
}

#[derive(Deserialize)]

pub struct EmoteSet {
    pub emotes: Vec<Emote>,
}

#[derive(Deserialize)]

pub struct Emote {
    pub id: String,
    pub name: String,
    pub data: EmoteData,
}

#[derive(Deserialize)]

pub struct EmoteData {
    pub host: EmoteHost,
}

#[derive(Deserialize)]

pub struct EmoteHost {
    pub url: String,
    pub files: Vec<EmoteHostFile>,
}

#[derive(Deserialize)]
pub struct EmoteHostFile {
    pub name: String,
    pub width: u32,
    pub height: u32,
    pub format: String,
}

pub async fn fetch_emotes(id: &str) -> Result<EmoteMap> {
    let mut all_emotes = fetch_global_emotes().await?;
    let user_emotes = fetch_user_emotes(id).await?;

    all_emotes.extend(user_emotes);

    let mut emotes = HashMap::new();

    for mut emote in all_emotes {
        emote
            .data
            .host
            .files
            .retain(|file| file.name.starts_with("4x"));

        if emote.data.host.files.is_empty() {
            continue;
        }

        let host = emote.data.host;
        let name = emote.name;

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

        for file in &host.files {
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
                name: name.clone(),
                url: format!("https:{}/{}", host.url, file.name),
                width: file.width / 4,
                height: file.height / 4,
            };

            emotes.insert(name, new_emote);
        }
    }

    Ok(emotes)
}

async fn fetch_global_emotes() -> Result<Vec<Emote>> {
    let global_set = reqwest::get(format!("{BASE_URL}/emote-sets/global"))
        .await?
        .json::<EmoteSet>()
        .await?;

    Ok(global_set.emotes)
}

async fn fetch_user_emotes(id: &str) -> Result<Vec<Emote>> {
    let user = reqwest::get(format!("{BASE_URL}/users/twitch/{id}"))
        .await?
        .json::<User>()
        .await?;

    Ok(user.emote_set.emotes)
}
