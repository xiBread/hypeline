use std::collections::HashMap;

use serde::Serialize;

#[derive(Serialize)]
pub struct Emote {
    pub id: String,
    pub name: String,
    pub url: String,
    pub width: u32,
    pub height: u32,
}

pub type EmoteMap = HashMap<String, Emote>;
