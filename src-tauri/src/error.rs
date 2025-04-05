use serde::{Serialize, Serializer};
use twitch_api::helix::ClientRequestError;

#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error(transparent)]
    Generic(#[from] anyhow::Error),

    #[error(transparent)]
    Http(#[from] reqwest::Error),

    #[error(transparent)]
    Helix(#[from] ClientRequestError<reqwest::Error>),

    #[error(transparent)]
    Sqlx(#[from] sqlx::Error),
}

impl Serialize for Error {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        serializer.serialize_str(&self.to_string())
    }
}
