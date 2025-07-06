use std::time::SystemTime;

use anyhow::Result;
use serde::{Deserialize, Serialize};

use crate::emotes::Emote;
use crate::error::Error;
use crate::HTTP;

const BASE_URL: &str = "https://7tv.io/v3";

#[derive(Deserialize)]

pub struct User {
    pub emote_set: Option<EmoteSet>,
}

#[derive(Serialize, Deserialize)]

pub struct EmoteSet {
    pub id: String,
    pub name: String,

    #[serde(default)]
    pub emotes: Vec<ApiEmote>,
}

#[derive(Clone, Serialize, Deserialize)]

pub struct ApiEmote {
    pub id: String,
    pub name: String,
    pub data: EmoteData,
}

#[derive(Clone, Serialize, Deserialize)]

pub struct EmoteData {
    pub host: EmoteHost,
    pub flags: u32,
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

impl From<ApiEmote> for Emote {
    fn from(value: ApiEmote) -> Self {
        let mut width = 28;
        let mut height = 28;
        let mut srcset = vec![];

        for format in ["webp", "gif", "png"] {
            let mut matched_files: Vec<&_> = value
                .data
                .host
                .files
                .iter()
                .filter(|file| file.format.to_lowercase() == format)
                .collect();

            if !matched_files.is_empty() {
                matched_files.sort_by_key(|file| file.width);

                for file in matched_files {
                    let url = format!("https:{}/{}", &value.data.host.url, file.name);

                    width = file.width;
                    height = file.height;

                    srcset.push(format!("{url} {}x", file.name.chars().nth(0).unwrap()));
                }

                break;
            }
        }

        Emote {
            id: value.id,
            name: value.name,
            width: width / 2,
            height: height / 2,
            srcset,
            zero_width: (value.data.flags & 256) == 256,
        }
    }
}

pub async fn fetch_global_emotes() -> Result<Vec<Emote>> {
    let global_set: EmoteSet = HTTP
        .get(format!("{BASE_URL}/emote-sets/global"))
        .send()
        .await?
        .json()
        .await?;

    Ok(global_set.emotes.into_iter().map(ApiEmote::into).collect())
}

pub async fn fetch_active_emote_set(id: &str) -> Result<Option<EmoteSet>, Error> {
    let now = SystemTime::now();

    let timestamp = now
        .duration_since(SystemTime::UNIX_EPOCH)
        .expect("time went backwards")
        .as_millis();

    let user: User = HTTP
        // Appending a timestamp parameter to bypass caching
        .get(format!("{BASE_URL}/users/twitch/{id}?t={timestamp}"))
        .send()
        .await?
        .json()
        .await?;

    Ok(user.emote_set)
}
