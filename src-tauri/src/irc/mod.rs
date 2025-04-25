// Local copy of https://github.com/robotty/twitch-irc-rs since there are some
// missing features and extra things not needed. Might move to a seperate repo
// later.

pub mod client;
mod config;
mod connection;
mod error;
pub mod message;
pub mod websocket;

pub use client::IrcClient;
pub use config::ClientConfig;
pub use error::Error;
