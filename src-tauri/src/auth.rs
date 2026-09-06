use anyhow::anyhow;
use keyring::Entry;
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Emitter, State, Url, WebviewUrl, WebviewWindow, WebviewWindowBuilder};
use tokio::sync::Mutex;
use twitch_api::HelixClient;
use twitch_api::twitch_oauth2::{AccessToken, UserToken};

use crate::AppState;
use crate::error::Error;

const KEYRING_SERVICE: &str = "com.hyperion.chat";
const KEYRING_USER: &str = "access-token";

const INTEGRITY_POLL_INTERVAL: tokio::time::Duration = tokio::time::Duration::from_millis(150);
const INTEGRITY_POLL_ATTEMPTS: u32 = 100;

fn keyring_entry() -> Result<Entry, Error> {
    Ok(Entry::new(KEYRING_SERVICE, KEYRING_USER)?)
}

/// The account a validated token belongs to, handed back to the frontend so it
/// can build its `CurrentUser` without a second round trip.
#[derive(Debug, Serialize)]
pub struct AuthUser {
    id: String,
    login: String,
}

impl From<&UserToken> for AuthUser {
    fn from(token: &UserToken) -> Self {
        Self {
            id: token.user_id.to_string(),
            login: token.login.to_string(),
        }
    }
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct TwitchAuth {
    access_token: String,
    integrity_token: Option<String>,
    device_id: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct IntegrityResult {
    #[serde(default)]
    integrity_token: Option<String>,
    device_id: String,
    #[serde(default)]
    error: Option<String>,
}

async fn eval_value(window: &WebviewWindow, js: impl Into<String>) -> Option<String> {
    let (tx, rx) = tokio::sync::oneshot::channel();
    let tx = std::sync::Mutex::new(Some(tx));

    window
        .eval_with_callback(js, move |value| {
            if let Ok(mut tx) = tx.lock()
                && let Some(tx) = tx.take()
            {
                let _ = tx.send(value);
            }
        })
        .inspect_err(|err| tracing::error!(%err, "Failed to evaluate script in login window"))
        .ok()?;

    rx.await.ok()
}

async fn fetch_integrity(window: &WebviewWindow, access_token: &str) -> Option<IntegrityResult> {
    // The result is stashed on the window since eval can't await promises
    let started = eval_value(
        window,
        format!(
            r#"(() => {{
                window.__hyperionAuth = null;

                (async () => {{
                    const bytes = new Uint8Array(16);
                    crypto.getRandomValues(bytes);

                    const deviceId = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");

                    try {{
                        const res = await fetch("https://gql.twitch.tv/integrity", {{
                            method: "POST",
                            headers: {{
                                "Client-Id": "kimne78kx3ncx6brgo4mv6wki5h1ko",
                                "X-Device-Id": deviceId,
                                "Authorization": "OAuth {access_token}"
                            }}
                        }});

                        if (!res.ok) {{
                            throw new Error(`integrity request failed with status ${{res.status}}`);
                        }}

                        const data = await res.json();
                        window.__hyperionAuth = {{ deviceId, integrityToken: data.token }};
                    }} catch (err) {{
                        window.__hyperionAuth = {{ deviceId, error: String(err) }};
                    }}
                }})();

                return true;
            }})();"#
        ),
    )
    .await;

    started?;

    for _ in 0..INTEGRITY_POLL_ATTEMPTS {
        tokio::time::sleep(INTEGRITY_POLL_INTERVAL).await;

        let Some(value) = eval_value(window, "window.__hyperionAuth").await else {
            continue;
        };

        if value.is_empty() || value == "null" {
            continue;
        }

        return serde_json::from_str::<IntegrityResult>(&value)
            .inspect_err(|err| tracing::error!(%err, "Malformed integrity result: {value}"))
            .ok();
    }

    tracing::warn!("Timed out waiting for the integrity token");

    None
}

#[tauri::command]
pub async fn open_twitch_login(app: AppHandle) -> Result<(), String> {
    let auth_url =
        WebviewUrl::External(Url::parse("https://www.twitch.tv/login").map_err(|e| e.to_string())?);

    let auth_window = WebviewWindowBuilder::new(&app, "twitch-login", auth_url)
        .title("Twitch Login")
        .inner_size(500.0, 500.0)
        .resizable(false)
        .build()
        .map_err(|e| e.to_string())?;

    let app_handle = app.clone();
    let window_handle = auth_window.clone();

    tauri::async_runtime::spawn(async move {
        // Url without www because the auth-token cookie is set for .twitch.tv
        let twitch_domain = Url::parse("https://twitch.tv").unwrap();

        loop {
            tokio::time::sleep(tokio::time::Duration::from_millis(800)).await;

            if window_handle.is_closable().is_err() {
                break;
            }

            if let Ok(cookies) = window_handle.cookies_for_url(twitch_domain.clone())
                && let Some(auth_cookie) = cookies.into_iter().find(|c| c.name() == "auth-token")
            {
                let access_token = auth_cookie.value().to_string();
                let integrity = fetch_integrity(&window_handle, &access_token).await;

                if let Some(error) = integrity.as_ref().and_then(|result| result.error.as_ref()) {
                    tracing::warn!(%error, "Failed to fetch an integrity token");
                }

                let auth = TwitchAuth {
                    access_token,
                    device_id: integrity
                        .as_ref()
                        .map(|result| result.device_id.clone())
                        .unwrap_or_default(),
                    integrity_token: integrity.and_then(|result| result.integrity_token),
                };

                let _ = app_handle.emit_to("main", "twitch-auth-success", &auth);
                let _ = window_handle.close();

                break;
            }
        }
    });

    Ok(())
}

#[tauri::command]
pub async fn store_token(
    state: State<'_, Mutex<AppState>>,
    access_token: String,
) -> Result<AuthUser, Error> {
    let mut state = state.lock().await;

    let token = UserToken::from_token(&state.helix, AccessToken::new(access_token))
        .await
        .map_err(|err| {
            tracing::error!(%err, "Rejected access token");
            Error::Generic(anyhow!("Twitch rejected the access token: {err}"))
        })?;

    keyring_entry()?.set_password(token.access_token.as_str())?;

    let user = AuthUser::from(&token);
    tracing::info!(login = %token.login, "Stored access token");

    state.token = Some(token);

    Ok(user)
}

#[tauri::command]
pub async fn clear_token(state: State<'_, Mutex<AppState>>) -> Result<(), Error> {
    state.lock().await.token = None;

    match keyring_entry()?.delete_credential() {
        Ok(()) | Err(keyring::Error::NoEntry) => Ok(()),
        Err(err) => Err(err.into()),
    }
}

#[tauri::command]
pub async fn get_token(state: State<'_, Mutex<AppState>>) -> Result<Option<String>, Error> {
    let state = state.lock().await;

    Ok(state
        .token
        .as_ref()
        .map(|token| token.access_token.as_str().to_string()))
}

pub fn get_access_token(state: &AppState) -> Result<&UserToken, Error> {
    state.token.as_ref().ok_or_else(|| {
        tracing::error!("Attempted to retrieve access token but no token is set");
        Error::Generic(anyhow!("Access token not set"))
    })
}

pub async fn restore_token(helix: &HelixClient<'static, reqwest::Client>) -> Option<UserToken> {
    let entry = keyring_entry()
        .inspect_err(|err| tracing::error!(%err, "Failed to open keyring entry"))
        .ok()?;

    let stored = match entry.get_password() {
        Ok(stored) => stored,
        Err(keyring::Error::NoEntry) => {
            tracing::info!("No stored access token");
            return None;
        }
        Err(err) => {
            tracing::error!(%err, "Failed to read stored access token");
            return None;
        }
    };

    match UserToken::from_token(helix, AccessToken::new(stored)).await {
        Ok(token) => {
            tracing::info!(login = %token.login, "Restored stored access token");
            Some(token)
        }
        Err(err) => {
            tracing::warn!(%err, "Stored access token is no longer valid, clearing it");

            if let Err(err) = entry.delete_credential() {
                tracing::error!(%err, "Failed to delete invalid access token");
            }

            None
        }
    }
}
