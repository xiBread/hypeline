use anyhow::anyhow;
use serde::Serialize;
use serde_json::json;
use tauri::State;
use tokio::sync::Mutex;
use twitch_api::eventsub::EventType;
use twitch_api::helix::bits::{Cheermote, GetCheermotesRequest};
use twitch_api::helix::chat::{get_global_chat_badges, BadgeSet};
use twitch_api::helix::streams::Stream;
use twitch_api::twitch_oauth2::UserToken;
use twitch_api::HelixClient;

use super::channels::get_stream;
use super::get_access_token;
use super::users::{get_user_from_login, User};
use crate::emotes::{fetch_user_emotes, Emote, EmoteMap};
use crate::error::Error;
use crate::providers::seventv::{fetch_active_emote_set, send_presence, EmoteSet};
use crate::providers::twitch::fetch_channel_badges;
use crate::AppState;

#[derive(Serialize)]
pub struct JoinedChannel {
    id: String,
    user: User,
    stream: Option<Stream>,
    emotes: EmoteMap,
    emote_set: Option<EmoteSet>,
    cheermotes: Vec<Cheermote>,
    badges: Vec<BadgeSet>,
}

#[tauri::command]
pub async fn join(
    state: State<'_, Mutex<AppState>>,
    login: String,
) -> Result<JoinedChannel, Error> {
    let (helix, token, irc, eventsub, seventv, stv_id) = {
        let state = state.lock().await;

        let token = state
            .token
            .as_ref()
            .ok_or_else(|| Error::Generic(anyhow!("Access token not set")))?;

        let Some(irc) = state.irc.clone() else {
            return Err(Error::Generic(anyhow!("No IRC connection")));
        };

        (
            state.helix.clone(),
            token.clone(),
            irc,
            state.eventsub.clone(),
            state.seventv.clone(),
            state.seventv_id.clone(),
        )
    };

    let user = get_user_from_login(state.clone(), login)
        .await?
        .expect("user not found");

    let broadcaster_id = user.data.id.as_str();
    let login = user.data.login.to_string();

    let (stream, mut emotes, emote_set, cheermotes, badges) = tokio::try_join!(
        get_stream(state.clone(), user.data.id.to_string()),
        fetch_user_emotes(broadcaster_id),
        fetch_active_emote_set(broadcaster_id),
        get_cheermotes(&helix, &token, broadcaster_id.to_string()),
        fetch_channel_badges(&helix, &token, login),
    )?;

    let stv_emotes = match emote_set {
        Some(ref emote_set) => emote_set
            .emotes
            .clone()
            .into_iter()
            .map(Emote::from)
            .collect(),
        None => vec![],
    };

    for emote in stv_emotes {
        emotes.insert(emote.name.clone(), emote);
    }

    let login = user.data.login.clone();

    let channel_cond = json!({
        "broadcaster_user_id": broadcaster_id
    });

    let channel_with_user_cond = json!({
        "broadcaster_user_id": broadcaster_id,
        "user_id": token.user_id
    });

    let channel_with_mod_cond = json!({
        "broadcaster_user_id": broadcaster_id,
        "moderator_user_id": token.user_id
    });

    if let Some(eventsub) = eventsub {
        #[rustfmt::skip]
        eventsub
            .subscribe_all(
                login.as_str(),
                &[
					(EventType::AutomodMessageHold, &channel_with_mod_cond),
					(EventType::AutomodMessageUpdate, &channel_with_mod_cond),
					(EventType::ChannelChatUserMessageHold, &channel_with_user_cond),
					(EventType::ChannelChatUserMessageUpdate, &channel_with_user_cond),
                    (EventType::ChannelModerate, &channel_with_mod_cond),
                    (EventType::ChannelSubscriptionEnd, &channel_cond),
					(EventType::ChannelSuspiciousUserMessage, &channel_with_mod_cond),
					(EventType::ChannelSuspiciousUserUpdate, &channel_with_mod_cond),
                    (EventType::ChannelUnbanRequestCreate, &channel_with_mod_cond),
                    (EventType::ChannelUnbanRequestResolve, &channel_with_mod_cond),
                    (EventType::ChannelWarningAcknowledge, &channel_with_mod_cond),
                    (EventType::StreamOffline, &channel_cond),
                    (EventType::StreamOnline, &channel_cond),
                ],
            )
            .await?;
    }

    if let Some(seventv) = seventv {
        let channel_cond = json!({
            "ctx": "channel",
            "platform": "TWITCH",
            "id": broadcaster_id
        });

        seventv.subscribe("cosmetic.create", &channel_cond).await;
        seventv.subscribe("entitlement.create", &channel_cond).await;

        if let Some(ref set) = emote_set {
            seventv
                .subscribe("emote_set.*", &json!({ "object_id": set.id }))
                .await;
        }
    }

    if let Some(ref id) = stv_id {
        send_presence(id, broadcaster_id).await;
    }

    irc.join(login.to_string());

    Ok(JoinedChannel {
        id: broadcaster_id.to_string(),
        user,
        stream,
        emotes,
        emote_set,
        cheermotes,
        badges,
    })
}

#[tauri::command]
pub async fn leave(state: State<'_, Mutex<AppState>>, channel: String) -> Result<(), Error> {
    let state = state.lock().await;

    if let Some(ref eventsub) = state.eventsub {
        eventsub.unsubscribe_all(&channel).await?;
    }

    if let Some(ref seventv) = state.seventv {
        seventv.unsubscribe().await;
    }

    if let Some(ref irc) = state.irc {
        irc.part(channel);
    }

    Ok(())
}

#[tauri::command]
pub async fn send_message(
    state: State<'_, Mutex<AppState>>,
    content: String,
    broadcaster_id: String,
    reply_id: Option<String>,
) -> Result<(), Error> {
    let state = state.lock().await;
    let token = get_access_token(&state).await?;

    let user_id = token.user_id.clone();

    let sent = if let Some(reply_id) = reply_id {
        state
            .helix
            .send_chat_message_reply(
                &broadcaster_id,
                &user_id,
                &reply_id,
                content.as_str(),
                token,
            )
            .await
            .is_ok_and(|resp| resp.is_sent)
    } else {
        state
            .helix
            .send_chat_message(&broadcaster_id, &user_id, content.as_str(), token)
            .await
            .is_ok_and(|resp| resp.is_sent)
    };

    if sent {
        if let Some(ref id) = state.seventv_id {
            send_presence(id, &broadcaster_id).await;
        }
    }

    Ok(())
}

pub async fn get_cheermotes(
    helix: &HelixClient<'static, reqwest::Client>,
    token: &UserToken,
    broadcaster_id: String,
) -> Result<Vec<Cheermote>, Error> {
    let request = GetCheermotesRequest::broadcaster_id(broadcaster_id);

    match helix.req_get(request, token).await {
        Ok(response) => Ok(response.data),
        Err(_) => Ok(vec![]),
    }
}

#[tauri::command]
pub async fn fetch_global_badges(
    state: State<'_, Mutex<AppState>>,
) -> Result<Vec<BadgeSet>, Error> {
    let state = state.lock().await;
    let token = get_access_token(&state).await?;

    let badges = state
        .helix
        .req_get(
            get_global_chat_badges::GetGlobalChatBadgesRequest::new(),
            token,
        )
        .await?
        .data;

    Ok(badges)
}
