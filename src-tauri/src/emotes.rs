use std::collections::HashMap;

use anyhow::Result;
use serde::Serialize;
use sqlx::{Pool, Sqlite};
use twitch_api::helix::users::User;

use crate::seventv;

#[derive(Serialize)]
pub struct Emote {
    pub id: String,
    pub name: String,
    pub url: String,
    pub width: u32,
    pub height: u32,
}

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

pub async fn fetch_bttv_emotes() {
    todo!()
}

pub async fn fetch_7tv_emotes(id: &str) -> Result<HashMap<String, Emote>> {
    let mut emotes = HashMap::new();
    let response = reqwest::get(format!("https://7tv.io/v3/users/twitch/{id}"))
        .await?
        .json::<seventv::User>()
        .await?;

    for mut emote in response.emote_set.emotes {
        emote
            .data
            .host
            .files
            .retain(|file| file.name.starts_with("4x"));

        if emote.data.host.files.is_empty() {
            continue;
        }

        let host = emote.data.host;
        let name = emote.name;

        let priority = |format: &str| match format.to_lowercase().as_str() {
            // Animated AVIFs are broken
            // "avif" => Some(0),
            "webp" => Some(1),
            "png" => Some(2),
            "gif" => Some(3),
            _ => None,
        };

        let mut best_priority: Option<usize> = None;
        let mut best_file: Option<&_> = None;

        for file in &host.files {
            if let Some(p) = priority(&file.format) {
                if best_priority.is_none() || p < best_priority.unwrap() {
                    best_priority = Some(p);
                    best_file = Some(file);
                }
            }
        }

        if let Some(file) = best_file {
            let new_emote = Emote {
                id: emote.id,
                name: name.clone(),
                url: format!("https:{}/{}", host.url, file.name),
                width: file.width,
                height: file.height,
            };

            emotes.insert(name, new_emote);
        }
    }

    Ok(emotes)
}
