import { invoke } from "@tauri-apps/api/core";
import WebSocket from "@tauri-apps/plugin-websocket";
import { handlers } from "$lib/handlers";
import { settings } from "$lib/settings";
import { app } from "$lib/state.svelte";
import type * as Events from "./events";
import type {
	Notification,
	SessionWelcome,
	WebSocketMessage,
} from "./websocket";

export * from "./events";
export * from "./websocket";

export interface EventSubSubscriptionMap {
	"channel.chat.message": Events.ChannelChatMessage;
	"channel.chat.message_delete": Events.ChannelChatMessageDelete;
	"channel.chat.notification": Events.ChannelChatNotification;
	"user.update": Events.UserUpdate;
}

export async function connect() {
	const ws = await WebSocket.connect("wss://eventsub.wss.twitch.tv/ws");
	app.ws = ws;

	ws.addListener(async (message) => {
		if (!settings.state.user) return;

		switch (message.type) {
			case "Ping": {
				ws.send({ type: "Pong", data: message.data });
				break;
			}

			case "Text": {
				const msg: WebSocketMessage = JSON.parse(message.data);

				// todo: extract this to a function
				switch (msg.metadata.message_type) {
					case "session_welcome": {
						console.log("Session welcome");

						const { session } = msg.payload as SessionWelcome;
						app.wsSessionId = session.id;

						await invoke("subscribe", {
							sessionId: app.wsSessionId,
							event: "user.update",
							condition: {
								user_id: settings.state.user.id,
							},
						});

						break;
					}

					case "notification": {
						const payload = msg.payload as Notification;

						const handler = handlers.get(payload.subscription.type);
						await handler?.handle(payload.event);
					}
				}

				break;
			}

			case "Close": {
				console.log("Connection closed");
				break;
			}
		}
	});
}
