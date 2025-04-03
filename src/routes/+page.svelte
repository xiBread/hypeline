<script lang="ts">
	import WebSocket from "@tauri-apps/plugin-websocket";
	import { page } from "$app/state";
	import { getAuthUrl } from "$lib/auth";
	import Chat from "$lib/components/Chat.svelte";
	import Input from "$lib/components/Input.svelte";
	import { onDestroy, onMount } from "svelte";
	import { subscribe, websocketData } from "$lib/event-sub";

	let messages = $state<string[]>([]);

	let disconnect = async (): Promise<void> => {};

	onMount(async () => {
		const ws = await WebSocket.connect(
			"wss://eventsub.wss.twitch.tv/ws?keepalive_timeout_seconds=30",
		);

		disconnect = () => ws.disconnect();

		ws.addListener(async (message) => {
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
					if (!page.data.user) return;

					const data = websocketData.parse(JSON.parse(message.data));

					// todo: extract this to a function
					switch (data.metadata.message_type) {
						case "session_welcome": {
							await subscribe(
								data.payload.session.id,
								"user.update",
								{ user_id: page.data.user.id },
							);

							// temporary
							await subscribe(
								data.payload.session.id,
								"channel.chat.message",
								{
									broadcaster_user_id: "91067577",
									user_id: page.data.user.id,
								},
							);
						}

						case "notification": {
							// and this
							if (
								data.payload.subscription.type ===
								"channel.chat.message"
							) {
								console.log(data.payload.event);
								messages.push(data.payload.event.message.text);
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
	});

	onDestroy(() => disconnect());
</script>

<div class="flex h-screen flex-col">
	{#if page.data.user}
		<Chat class="grow" {messages} />

		<div class="border-t p-2">
			<Input
				class="focus-visible:ring-twitch focus-visible:border-twitch focus-visible:ring-1"
				type="text"
				placeholder="Send a message"
				maxlength={500}
				autocapitalize="off"
				autocorrect="off"
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
