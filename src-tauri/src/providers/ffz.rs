use std::collections::HashMap;

use serde::Deserialize;

#[derive(Deserialize)]
pub struct Room {
    pub room: RoomInner,
    pub sets: HashMap<String, EmoteSet>,
}

#[derive(Deserialize)]
pub struct RoomInner {
    pub set: u32,
}

#[derive(Deserialize)]
pub struct EmoteSet {
    pub emoticons: Vec<Emote>,
}

#[derive(Deserialize)]
pub struct Emote {
    pub id: u32,
    pub name: String,
    pub height: u32,
    pub width: u32,
    pub urls: HashMap<String, String>,
}
