use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;

use tauri::{AppHandle, Emitter, Manager, Url};
use tokio::io::{AsyncReadExt, AsyncWriteExt};
use tokio::net::{TcpListener, TcpStream};
use tokio::sync::Mutex;

use crate::api::set_access_token;
use crate::error::Error;
use crate::AppState;

const ADDR: &str = "127.0.0.1:55331";

#[tauri::command]
pub async fn start_server(app_handle: AppHandle) -> Result<(), Error> {
    let listener = TcpListener::bind(ADDR).await?;
    let should_break = Arc::new(AtomicBool::default());

    tokio::spawn(async move {
        while !should_break.load(Ordering::SeqCst) {
            let (stream, _) = listener.accept().await?;

            let task_should_break = should_break.clone();
            let app_handle = app_handle.clone();

            tokio::spawn(async move {
                if let Some(url) = handle_connection(stream).await {
                    if !url.is_empty()
                        && task_should_break
                            .compare_exchange(false, true, Ordering::Relaxed, Ordering::Relaxed)
                            .is_ok()
                    {
                        handle_url(app_handle, url).await;
                    }
                }
            });
        }

        Ok::<_, Error>(())
    });

    Ok(())
}

async fn handle_connection(mut stream: TcpStream) -> Option<String> {
    let mut buffer = [0; 4096];

    if stream.read(&mut buffer).await.is_err() {
        return None;
    }

    let mut headers = [httparse::EMPTY_HEADER; 32];
    let mut request = httparse::Request::new(&mut headers);
    request.parse(&buffer).ok()?;

    let mut host = "127.0.0.1";

    for header in &headers {
        if header.name == "Full-Url" {
            return Some(String::from_utf8_lossy(header.value).to_string());
        }

        if header.name == "Host" && header.value.starts_with(b"localhost") {
            host = "localhost";
        }
    }

    let script = format!(
        r#"<script type="module">
			try {{
				await fetch("http://{host}:55331/callback", {{
					headers: {{
						"Full-Url": location.href
					}}
				}})
			}} catch {{}}
		</script>"#
    );

    let response = format!(
        r"<html>
			<head>{script}</head>
			<body>Return to app</body>
		</html>"
    );

    stream
        .write_all(
            format!(
                "HTTP/1.1 200 OK\r\nContent-Length: {}\r\n\r\n{response}",
                response.len()
            )
            .as_bytes(),
        )
        .await
        .unwrap();

    stream.flush().await.unwrap();

    None
}

async fn handle_url(app_handle: AppHandle, mut url: String) {
    url = url.replace("#", "?");

    let Ok(url) = Url::parse(&url) else {
        return;
    };

    let Some(token) = url.query_pairs().find_map(|(k, v)| {
        if k == "access_token" {
            Some(v.to_string())
        } else {
            None
        }
    }) else {
        return;
    };

    let state = app_handle.state::<Mutex<AppState>>();
    set_access_token(state, token.clone()).await;

    app_handle.emit("accesstoken", token).unwrap();
}
