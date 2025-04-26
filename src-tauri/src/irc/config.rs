use std::sync::Arc;
use std::time::Duration;

use tokio::sync::Semaphore;

#[derive(Debug)]
pub struct ClientConfig {
    pub login: String,
    pub token: String,
    pub max_channels_per_connection: usize,
    pub max_waiting_messages_per_connection: usize,
    pub connection_rate_limiter: Arc<Semaphore>,
    pub new_connection_every: Duration,
    pub connect_timeout: Duration,
}

impl ClientConfig {
    pub fn new(login: String, token: String) -> ClientConfig {
        ClientConfig {
            login,
            token,
            max_channels_per_connection: 90,
            max_waiting_messages_per_connection: 5,
            connection_rate_limiter: Arc::new(Semaphore::new(1)),
            new_connection_every: Duration::from_secs(2),
            connect_timeout: Duration::from_secs(20),
        }
    }
}
