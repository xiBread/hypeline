use std::collections::HashMap;

use anyhow::Result;
use serde::Serialize;
use sqlx::{Pool, Sqlite};
use twitch_api::helix::users::User;

#[derive(Serialize)]
pub struct Emote {
    pub id: String,
    pub name: String,
    pub url: String,
    pub width: u32,
    pub height: u32,
}

pub type EmoteMap = HashMap<String, Emote>;

pub async fn save_emotes(
    db: &Pool<Sqlite>,
    user: &User,
    emotes: HashMap<String, Emote>,
) -> Result<()> {
    let mut tx = db.begin().await?;
    let username = user.login.as_str();

    sqlx::query("DELETE FROM emotes WHERE username = ?")
        .bind(username)
        .execute(&mut *tx)
        .await?;

    if emotes.is_empty() {
        tx.commit().await?;
        return Ok(());
    }

    let emote_values: Vec<&Emote> = emotes.values().collect();

    let mut query_str = String::from(
        "INSERT INTO emotes (id, name, url, width, height, username, user_id) VALUES ",
    );

    let placeholders: Vec<String> = emote_values
        .iter()
        .map(|_| "(?, ?, ?, ?, ?, ?, ?)".to_string())
        .collect();

    query_str.push_str(&placeholders.join(", "));

    let mut query = sqlx::query(&query_str);

    for emote in emote_values {
        query = query
            .bind(&emote.id)
            .bind(&emote.name)
            .bind(&emote.url)
            .bind(emote.width)
            .bind(emote.height)
            .bind(username)
            .bind(user.id.as_str())
    }

    query.execute(&mut *tx).await?;
    tx.commit().await?;

    Ok(())
}
