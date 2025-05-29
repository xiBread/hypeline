use std::collections::HashMap;

use serde::Serialize;

use crate::error::Error;
use crate::providers::{bttv, ffz, seventv};

#[derive(Serialize)]
pub struct Emote {
    pub id: String,
    pub name: String,
    pub width: u32,
    pub height: u32,
    pub srcset: Vec<String>,
    pub zero_width: bool,
}

pub type EmoteMap = HashMap<String, Emote>;

#[tracing::instrument]
#[tauri::command]
pub async fn fetch_global_emotes() -> Result<Vec<Emote>, Error> {
    tracing::info!("Fetching global emotes");

    let (bttv, ffz, seventv) = tokio::try_join!(
        bttv::fetch_global_emotes(),
        ffz::fetch_global_emotes(),
        seventv::fetch_global_emotes(),
    )?;

    let mut all_emotes = bttv;
    all_emotes.extend(ffz);
    all_emotes.extend(seventv);

    tracing::info!("Fetched {} global emotes", all_emotes.len());

    Ok(all_emotes)
}

#[tracing::instrument]
pub async fn fetch_user_emotes(id: &str) -> Result<EmoteMap, Error> {
    tracing::info!("Fetching user emotes");

    let mut emotes = HashMap::new();

    let (bttv, ffz) = tokio::try_join!(bttv::fetch_user_emotes(id), ffz::fetch_user_emotes(id))?;

    let mut all_emotes = bttv;
    all_emotes.extend(ffz);

    for emote in all_emotes {
        emotes.insert(emote.name.clone(), emote);
    }

    tracing::info!("Fetched {} user emotes", emotes.len());

    Ok(emotes)
}
