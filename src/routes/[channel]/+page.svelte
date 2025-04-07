<!-- MOST CODE IN THIS FILE (and related) IS TEMPORARY DURING DEVELOPMENT; WILL CLEAN UP LATER -->
<script lang="ts">
	import WebSocket from "@tauri-apps/plugin-websocket";
	import { getAuthUrl } from "$lib/auth";
	import Chat, { type Message } from "$lib/components/Chat.svelte";
	import Input from "$lib/components/Input.svelte";
	import {
		Notification,
		SessionWelcome,
		WebSocketMessage,
		type NotificationPayload,
	} from "$lib/twitch-api";
	import { settings } from "$lib/settings.svelte";
	import { appState } from "$lib/app-state.svelte";
	import { invoke } from "@tauri-apps/api/core";
	import { type Emote } from "$lib/chat";
	import { reinterpretFragments } from "$lib/chat";
	import { SvelteMap } from "svelte/reactivity";

	const { data } = $props();

	let messages = $state<Message[]>([]);

	let channelId = $state("");
	let channelEmotes = new SvelteMap<string, Emote>();

	let disconnect = async () => {};

	$effect(() => {
		messages = [];
		connect(data.channel);

		return () => disconnect();
	});

	async function connect(channel: string) {
		const ws = await WebSocket.connect("wss://eventsub.wss.twitch.tv/ws");
		disconnect = () => ws.disconnect();

		ws.addListener(async (message) => {
			if (!settings.user) return;

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
							appState.wsSessionId = session.id;

							await invoke("create_eventsub_subscription", {
								sessionId: appState.wsSessionId,
								event: "user.update",
								condition: null,
							});

							// temporary
							const [id, emotes] = await invoke<
								[string, Record<string, Emote>]
							>("join_chat", { sessionId: session.id, channel });

							channelId = id;

							for (const [name, emote] of Object.entries(
								emotes,
							)) {
								channelEmotes.set(name, emote);
							}

							break;
						}

						case "notification": {
							const payload = Notification.parse(
								msg.payload,
							) as NotificationPayload;

							// and this
							if (payload.type === "channel.chat.message") {
								const raw = payload.event;

								messages.push({
									...raw,
									fragments: reinterpretFragments(
										raw.message.fragments,
										channelEmotes,
									),
								});
							}
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
			broadcasterId: channelId,
		});
	}
</script>

<div class="flex h-screen flex-col">
	{#if settings.user}
		<Chat class="h-full grow" {messages} />

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
	{:else}
		<a
			class="bg-twitch m-auto flex items-center gap-2.5 rounded-md px-4 py-2 font-medium text-white"
			href={getAuthUrl().toString()}
		>
			<svg
				class="size-5 fill-white"
				role="img"
				viewBox="0 0 24 24"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"
				/>
			</svg>

			Log in with Twitch
		</a>
	{/if}
</div>
