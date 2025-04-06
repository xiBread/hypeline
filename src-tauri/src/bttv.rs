use serde::Deserialize;

#[derive(Deserialize)]
pub struct User {
    #[serde(rename = "channelEmotes")]
    pub channel_emotes: Vec<Emote>,

    #[serde(rename = "sharedEmotes")]
    pub shared_emotes: Vec<Emote>,
}

#[derive(Deserialize)]
pub struct Emote {
    pub id: String,
    pub code: String,
    pub width: Option<u32>,
    pub height: Option<u32>,
}
