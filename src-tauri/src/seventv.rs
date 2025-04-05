use serde::Deserialize;

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
