import { invoke } from "@tauri-apps/api/core";
import WebSocket from "@tauri-apps/plugin-websocket";
import { handlers } from "$lib/handlers/manager";
import { app, settings } from "$lib/state.svelte";
import type * as Events from "./events";
import { Notification, SessionWelcome, WebSocketMessage } from "./websocket";

export * from "./events";
export * from "./websocket";

export interface EventSubSubscriptionMap {
	"channel.chat.message": typeof Events.ChannelChatMessage;
	"user.update": typeof Events.UserUpdate;
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

			case "Pong": {
				console.log("Pong");
				break;
			}

			case "Text": {
				const msg = WebSocketMessage.parse(JSON.parse(message.data));

				// todo: extract this to a function
				switch (msg.metadata.message_type) {
					case "session_welcome": {
						console.log("Session welcome");

						const { session } = SessionWelcome.parse(msg.payload);
						app.wsSessionId = session.id;

						await invoke("subscribe", {
							sessionId: app.wsSessionId,
							event: "user.update",
							condition: null,
						});

						break;
					}

					case "notification": {
						const payload = Notification.parse(msg.payload);

						const handler = handlers.get(payload.type);
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
