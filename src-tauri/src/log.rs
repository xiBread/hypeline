use serde::Deserialize;
use tauri::{App, Manager};
use time::macros::format_description;
use time::UtcOffset;
use tracing_appender::non_blocking::WorkerGuard;
use tracing_subscriber::fmt::time::OffsetTime;
use tracing_subscriber::layer::SubscriberExt;
use tracing_subscriber::util::SubscriberInitExt;
use tracing_subscriber::{fmt, EnvFilter, Layer};

#[must_use]
pub fn init_tracing(app: &App) -> WorkerGuard {
    let time_format = format_description!(
        "[year]-[month padding:zero]-[day padding:zero] [hour]:[minute]:[second].[subsecond digits:3]"
    );
    let time_offset = UtcOffset::current_local_offset().unwrap_or(UtcOffset::UTC);
    let timer = OffsetTime::new(time_offset, time_format);

    let path = app
        .path()
        .app_log_dir()
        .expect("failed to get app log directory");

    if !path.exists() {
        let _ = std::fs::create_dir_all(&path);
    }

    let appender = tracing_appender::rolling::daily(path, "hypeline.log");
    let (writer, guard) = tracing_appender::non_blocking(appender);

    let file_layer = fmt::layer()
        .with_ansi(false)
        .with_timer(timer.clone())
        .with_writer(writer)
        .with_filter(EnvFilter::new("hypeline_lib=trace,webview=trace"));

    let io_layer = fmt::layer()
        .with_ansi(true)
        .with_timer(timer)
        .with_writer(std::io::stdout)
        .with_filter(EnvFilter::new("hypeline_lib=debug,webview=debug"));

    tracing_subscriber::registry()
        .with(file_layer)
        .with(io_layer)
        .init();

    guard
}

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
pub fn log(level: LogLevel, message: String) {
    macro_rules! emit {
		($level:expr) => {
			tracing::event!(target: "webview", $level, %message)
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
