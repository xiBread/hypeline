use std::fmt;

use serde::{Deserialize, Serialize};

use super::AsRawIrc;

#[derive(Debug, PartialEq, Eq, Clone, Hash, Serialize, Deserialize)]
pub enum IrcPrefix {
    HostOnly {
        host: String,
    },
    Full {
        nick: String,
        user: Option<String>,
        host: Option<String>,
    },
}

impl IrcPrefix {
    pub fn parse(source: &str) -> IrcPrefix {
        if !source.contains('@') {
            IrcPrefix::HostOnly {
                host: source.to_owned(),
            }
        } else {
            let mut at_split = source.splitn(2, '@');
            let nick_and_user = at_split.next().unwrap();
            let host = at_split.next();

            let mut exc_split = nick_and_user.splitn(2, '!');
            let nick = exc_split.next();
            let user = exc_split.next();

            IrcPrefix::Full {
                nick: nick.unwrap().to_owned(),
                user: user.map(|s| s.to_owned()),
                host: host.map(|s| s.to_owned()),
            }
        }
    }
}

impl AsRawIrc for IrcPrefix {
    fn format_as_raw_irc(&self, f: &mut fmt::Formatter<'_>) -> Result<(), fmt::Error> {
        match self {
            Self::HostOnly { host } => write!(f, "{host}")?,
            Self::Full { nick, user, host } => {
                write!(f, "{nick}")?;

                if let Some(host) = host {
                    if let Some(user) = user {
                        write!(f, "!{user}")?
                    }

                    write!(f, "@{host}")?;
                }
            }
        }
        Ok(())
    }
}
