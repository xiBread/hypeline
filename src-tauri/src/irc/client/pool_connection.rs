use std::collections::{HashSet, VecDeque};
use std::sync::Arc;
use std::time::Instant;
use tokio::sync::oneshot;

use crate::irc::connection::Connection;
use crate::irc::ClientConfig;

pub(crate) struct PoolConnection {
    config: Arc<ClientConfig>,
    tx_kill_incoming: Option<oneshot::Sender<()>>,
    pub id: usize,
    pub connection: Arc<Connection>,
    pub wanted_channels: HashSet<String>,
    pub server_channels: HashSet<String>,
    pub message_send_times: VecDeque<Instant>,
}

impl PoolConnection {
    pub fn new(
        config: Arc<ClientConfig>,
        id: usize,
        connection: Connection,
        tx_kill_incoming: oneshot::Sender<()>,
    ) -> PoolConnection {
        let message_send_times_max_entries = config.max_waiting_messages_per_connection * 2;

        PoolConnection {
            config,
            id,
            connection: Arc::new(connection),
            wanted_channels: HashSet::new(),
            server_channels: HashSet::new(),
            message_send_times: VecDeque::with_capacity(message_send_times_max_entries),
            tx_kill_incoming: Some(tx_kill_incoming),
        }
    }

    pub fn register_sent_message(&mut self) {
        let max_entries = self.config.max_waiting_messages_per_connection * 2;

        self.message_send_times.push_back(Instant::now());

        if self.message_send_times.len() > max_entries {
            self.message_send_times.pop_front();
        }
    }

    pub fn channels_limit_not_reached(&self) -> bool {
        let configured_limit = self.config.max_channels_per_connection;
        self.wanted_channels.len() < configured_limit
    }

    pub fn not_busy(&self) -> bool {
        let time_per_message = self.config.time_per_message;
        let max_waiting_per_connection = self.config.max_waiting_messages_per_connection;

        let mut messages_waiting = self.message_send_times.len();
        let current_time = Instant::now();
        let last_message_finished = None;

        for send_time in self.message_send_times.iter() {
            let start_time = match last_message_finished {
                Some(last_message_finished) => std::cmp::max(last_message_finished, send_time),
                None => send_time,
            };

            let finish_time = *start_time + time_per_message;

            if finish_time < current_time {
                messages_waiting -= 1;
            } else {
                break;
            }
        }

        messages_waiting < max_waiting_per_connection
    }
}

impl Drop for PoolConnection {
    fn drop(&mut self) {
        self.tx_kill_incoming.take().unwrap().send(()).ok();
    }
}
