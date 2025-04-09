<!-- MOST CODE IN THIS FILE (and related) IS TEMPORARY DURING DEVELOPMENT; WILL CLEAN UP LATER -->
<script lang="ts">
	import { invoke } from "@tauri-apps/api/core";
	import WebSocket from "@tauri-apps/plugin-websocket";
	import { join } from "$lib/chat";
	import Chat from "$lib/components/Chat.svelte";
	import Input from "$lib/components/Input.svelte";
	import { handlers } from "$lib/handlers/manager";
	import { app, chat, settings } from "$lib/state.svelte";
	import {
		Notification,
		SessionWelcome,
		WebSocketMessage,
	} from "$lib/twitch-api";
	import type { NotificationPayload } from "$lib/twitch-api";

	const { data } = $props();

	let disconnect = async () => {};

	$effect(() => {
		chat.messages = [];
		connect(data.channel);

		return () => disconnect();
	});

	async function connect(channel: string) {
		const ws = await WebSocket.connect("wss://eventsub.wss.twitch.tv/ws");
		disconnect = () => ws.disconnect();

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
					const msg = WebSocketMessage.parse(
						JSON.parse(message.data),
					);

					// todo: extract this to a function
					switch (msg.metadata.message_type) {
						case "session_welcome": {
							console.log("Session welcome");

							const { session } = SessionWelcome.parse(
								msg.payload,
							);
							app.wsSessionId = session.id;

							await invoke("create_eventsub_subscription", {
								sessionId: app.wsSessionId,
								event: "user.update",
								condition: null,
							});

							await join(channel);

							chat.messages.push({
								type: "system",
								text: `Joined ${channel}`,
							});

							break;
						}

						case "notification": {
							const payload = Notification.parse(
								msg.payload,
							) as NotificationPayload;

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

	async function send(event: KeyboardEvent) {
		if (event.key !== "Enter") return;

		event.preventDefault();

		const input = event.currentTarget as HTMLInputElement;
		const message = input.value.trim();

		if (!message) return;
		input.value = "";

		await invoke("send_message", {
			content: message,
			broadcasterId: chat.channelId,
		});
	}
</script>

<div class="flex h-screen flex-col">
	<Chat class="h-full grow" />

	<div class="border-t p-2">
		<Input
			class="focus-visible:ring-twitch focus-visible:border-twitch focus-visible:ring-1"
			type="text"
			placeholder="Send a message"
			maxlength={500}
			autocapitalize="off"
			autocorrect="off"
			onkeypress={send}
		/>
	</div>
</div>
