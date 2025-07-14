<script lang="ts">
	import { invoke } from "@tauri-apps/api/core";
	import { listen } from "@tauri-apps/api/event";
	import type { UnlistenFn } from "@tauri-apps/api/event";
	import { onDestroy, onMount } from "svelte";
	import { Channel } from "$lib/channel.svelte";
	import Chat from "$lib/components/Chat.svelte";
	import ChatInput from "$lib/components/ChatInput.svelte";
	import { handlers } from "$lib/handlers";
	import { settings } from "$lib/settings";
	import { app } from "$lib/state.svelte";
	import type { IrcMessage } from "$lib/twitch/irc";
	import StreamHeader from "./StreamInfo.svelte";

	const { username }: { username: string } = $props();

	let unlisten: UnlistenFn | undefined;

	onMount(async () => {
		unlisten = await listen<IrcMessage[]>("recentmessages", async (event) => {
			if (!app.joined) return;

			for (const message of event.payload) {
				const handler = handlers.get(message.type);
				await handler?.handle(message, app.joined);
			}
		});
	});

	onDestroy(() => unlisten?.());

	$effect(() => {
		join();

		return () => app.joined?.leave();
	});

	async function join() {
		try {
			const channel = await Channel.join(username.replace(/^ephemeral:/, ""));
			app.setJoined(channel);

			if (username.startsWith("ephemeral:")) {
				channel.setEphemeral();
				app.channels.push(channel);
			}

			await invoke("fetch_recent_messages", {
				channel: channel.user.username,
				historyLimit: settings.state.chat.history.enabled
					? settings.state.chat.history.limit
					: 0,
			});

			channel.addEmotes(app.globalEmotes);
		} catch (err) {
			app.setJoined(null);
			settings.state.lastJoined = null;
		}
	}
</script>

<div class="flex h-full flex-col">
	{#if app.joined?.stream}
		<StreamHeader stream={app.joined.stream} />
	{/if}

	<Chat class="grow" />

	<div class="p-2">
		<ChatInput />
	</div>
</div>
