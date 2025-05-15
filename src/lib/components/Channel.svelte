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

	const { username }: { username: string } = $props();

	let unlisten: UnlistenFn | undefined;

	onMount(async () => {
		unlisten = await listen<IrcMessage[]>("recentmessages", async (event) => {
			if (!app.active) return;

			for (const message of event.payload) {
				const handler = handlers.get(message.type);
				await handler?.handle(message, app.active);
			}
		});
	});

	onDestroy(() => unlisten?.());

	$effect(() => {
		join();

		return () => app.active?.leave();
	});

	async function join() {
		const channel = await Channel.join(username);
		app.setActive(channel);

		await invoke("fetch_recent_messages", {
			channel: channel.user.username,
			historyLimit: settings.state.history.enabled ? settings.state.history.limit : 0,
		});

		channel.addEmotes(app.globalEmotes);
	}
</script>

<div class="flex h-screen flex-col">
	<Chat class="grow" />

	<div class="p-2">
		<ChatInput />
	</div>
</div>
