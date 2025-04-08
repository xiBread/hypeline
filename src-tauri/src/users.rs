use anyhow::Result;
use sqlx::{Pool, Sqlite};
use twitch_api::helix::users::User;
use twitch_api::types::{BroadcasterType, UserType};

pub async fn insert_user(db: &Pool<Sqlite>, user: &User) -> Result<()> {
    let mut conn = db.acquire().await?;

    let user_type = match user.type_ {
        Some(t) => match t {
            UserType::None => "",
            UserType::Admin => "admin",
            UserType::GlobalMod => "global_mod",
            UserType::Staff => "staff",
        },
        None => "",
    };

    let broadcaster_type = match user.broadcaster_type {
        Some(t) => match t {
            BroadcasterType::None => "",
            BroadcasterType::Affiliate => "affiliate",
            BroadcasterType::Partner => "partner",
        },
        None => "",
    };

    sqlx::query(
        r"
			INSERT OR IGNORE INTO users (
				id, login, name, description, profile_image_url,
				type, broadcaster_type, created_at
			)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?)
		",
    )
    .bind(user.id.as_str())
    .bind(user.login.as_str())
    .bind(user.display_name.as_str())
    .bind(
        user.profile_image_url
            .as_ref()
            .unwrap_or(&String::default()),
    )
    .bind(user_type)
    .bind(broadcaster_type)
    .bind(user.description.as_ref().unwrap_or(&String::default()))
    .bind(user.created_at.to_string())
    .execute(&mut *conn)
    .await?;

    Ok(())
}
