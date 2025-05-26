use serde::Deserialize;

#[derive(Debug)]
pub enum LogLevel {
    Trace,
    Debug,
    Info,
    Warn,
    Error,
}

impl<'de> Deserialize<'de> for LogLevel {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: serde::Deserializer<'de>,
    {
        let s = String::deserialize(deserializer)?;

        match s.to_lowercase().as_str() {
            "trace" => Ok(LogLevel::Trace),
            "debug" => Ok(LogLevel::Debug),
            "info" => Ok(LogLevel::Info),
            "warn" => Ok(LogLevel::Warn),
            "error" => Ok(LogLevel::Error),
            _ => unreachable!(),
        }
    }
}

#[tauri::command]
pub fn log(level: LogLevel, message: String, location: Option<&str>) {
    macro_rules! emit {
		($level:expr) => {
			tracing::event!(target: "webview", $level, location, %message)
		};
	}

    match level {
        LogLevel::Trace => emit!(tracing::Level::TRACE),
        LogLevel::Debug => emit!(tracing::Level::DEBUG),
        LogLevel::Info => emit!(tracing::Level::INFO),
        LogLevel::Warn => emit!(tracing::Level::WARN),
        LogLevel::Error => emit!(tracing::Level::ERROR),
    }
}
