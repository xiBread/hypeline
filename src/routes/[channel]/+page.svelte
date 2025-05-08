<script lang="ts">
	import { invoke } from "@tauri-apps/api/core";
	import { listen } from "@tauri-apps/api/event";
	import type { UnlistenFn } from "@tauri-apps/api/event";
	import { onDestroy, onMount } from "svelte";
	import { Channel } from "$lib/channel.svelte";
	import Chat from "$lib/components/Chat.svelte";
	import Input, { replyTarget } from "$lib/components/Input.svelte";
	import { handlers } from "$lib/handlers";
	import { settings } from "$lib/settings";
	import { app } from "$lib/state.svelte";
	import type { IrcMessage } from "$lib/twitch/irc";

	const { data } = $props();

	let unlisten: UnlistenFn | undefined;

	onMount(async () => {
		unlisten = await listen<IrcMessage[]>(
			"recentmessages",
			async (event) => {
				for (const message of event.payload) {
					const handler = handlers.get(message.type);
					await handler?.handle(message);
				}
			},
		);
	});

	onDestroy(() => unlisten?.());

	$effect(() => {
		join();

		return () => app.active.leave();
	});

	async function join() {
		const channel = await Channel.join(data.channel);
		app.setActive(channel);

		await invoke("fetch_recent_messages", {
			channel: channel.user.username,
			historyLimit: settings.state.history.enabled
				? settings.state.history.limit
				: 0,
		});

		channel.addEmotes(app.globalEmotes);

		settings.state.lastJoined = data.channel;
	}

	async function send(event: KeyboardEvent) {
		if (event.key === "Escape" && replyTarget.value) {
			replyTarget.value = null;
			return;
		}

		if (event.key !== "Enter") return;

		event.preventDefault();

		const input = event.currentTarget as HTMLInputElement;
		const message = input.value.trim();

		if (!message) return;
		if (!event.ctrlKey) input.value = "";

		await app.active.send(message);
		replyTarget.value = null;
	}
</script>

<div class="flex h-screen flex-col">
	<Chat class="grow" />

	<div class="p-2">
		<Input onkeydown={send} />
	</div>
</div>
