use anyhow::anyhow;
use twitch_api::helix::chat::{get_channel_chat_badges, BadgeSet};
use twitch_api::twitch_oauth2::UserToken;
use twitch_api::HelixClient;

use crate::error::Error;

pub async fn fetch_channel_badges(
    helix: &HelixClient<'static, reqwest::Client>,
    token: &UserToken,
    channel: String,
) -> Result<Vec<BadgeSet>, Error> {
    let Some(user) = helix.get_user_from_login(&channel, token).await? else {
        return Err(Error::Generic(anyhow!("User not found")));
    };

    let badges = helix
        .req_get(
            get_channel_chat_badges::GetChannelChatBadgesRequest::broadcaster_id(&user.id),
            token,
        )
        .await?
        .data;

    Ok(badges)
}
