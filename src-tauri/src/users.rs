use twitch_api::helix::users::User as HelixUser;
use twitch_api::twitch_oauth2::UserToken;

#[derive(Default)]
pub struct User {
    pub data: Option<HelixUser>,
    pub token: Option<UserToken>,
}
