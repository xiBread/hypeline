use std::collections::HashMap;

use serde::Serialize;

use crate::error::Error;
use crate::providers::{bttv, ffz, seventv};

#[derive(Serialize)]
pub struct Emote {
    pub id: String,
    pub name: String,
    pub url: String,
    pub width: u32,
    pub height: u32,
}

pub type EmoteMap = HashMap<String, Emote>;

#[tauri::command]
pub async fn fetch_global_emotes() -> Result<Vec<Emote>, Error> {
    let bttv_emotes = bttv::fetch_global_emotes().await?;
    let ffz_emotes = ffz::fetch_global_emotes().await?;
    let seventv_emotes = seventv::fetch_global_emotes().await?;

    let mut all_emotes = bttv_emotes;
    all_emotes.extend(ffz_emotes);
    all_emotes.extend(seventv_emotes);

    Ok(all_emotes)
}

pub async fn fetch_user_emotes(id: &str) -> anyhow::Result<EmoteMap> {
    let mut emotes = HashMap::new();

    let bttv_emotes = bttv::fetch_user_emotes(id).await?;
    let ffz_emotes = ffz::fetch_user_emotes(id).await?;
    let seventv_emotes = seventv::fetch_user_emotes(id).await?;

    let mut all_emotes = bttv_emotes;
    all_emotes.extend(ffz_emotes);
    all_emotes.extend(seventv_emotes);

    for emote in all_emotes {
        emotes.insert(emote.name.clone(), emote);
    }

    Ok(emotes)
}
