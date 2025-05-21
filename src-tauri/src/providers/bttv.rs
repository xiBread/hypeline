use anyhow::Result;
use serde::Deserialize;

use crate::emotes::Emote;
use crate::HTTP;

const BASE_URL: &str = "https://api.betterttv.net/3/cached";
const CDN_URL: &str = "https://cdn.betterttv.net/emote";

#[derive(Deserialize)]
pub struct User {
    #[serde(default, rename = "channelEmotes")]
    pub channel_emotes: Vec<ApiEmote>,

    #[serde(default, rename = "sharedEmotes")]
    pub shared_emotes: Vec<ApiEmote>,
}

#[derive(Deserialize)]
pub struct ApiEmote {
    pub id: String,
    pub code: String,
    pub width: Option<u32>,
    pub height: Option<u32>,
}

impl From<ApiEmote> for Emote {
    fn from(value: ApiEmote) -> Self {
        let id = value.id.clone();

        let candidate = |density: u8| format!("{CDN_URL}/{}/{density}x {density}x", value.id);

        Emote {
            id,
            name: value.code,
            width: value.width.unwrap_or(28),
            height: value.height.unwrap_or(28),
            srcset: vec![candidate(1), candidate(2), candidate(3)],
            zero_width: false,
        }
    }
}

pub async fn fetch_global_emotes() -> Result<Vec<Emote>> {
    let emotes: Vec<ApiEmote> = HTTP
        .get(format!("{BASE_URL}/emotes/global"))
        .send()
        .await?
        .json()
        .await?;

    let emotes: Vec<_> = emotes.into_iter().map(ApiEmote::into).collect();
    Ok(emotes)
}

pub async fn fetch_user_emotes(id: &str) -> Result<Vec<Emote>> {
    let user = HTTP
        .get(format!("{BASE_URL}/users/twitch/{id}"))
        .send()
        .await?
        .json::<User>()
        .await?;

    let emotes: Vec<_> = user
        .channel_emotes
        .into_iter()
        .chain(user.shared_emotes.into_iter())
        .map(ApiEmote::into)
        .collect();

    Ok(emotes)
}
