<script lang="ts">
	import { invoke } from "@tauri-apps/api/core";
	import { listen } from "@tauri-apps/api/event";
	import type { UnlistenFn } from "@tauri-apps/api/event";
	import { onDestroy, onMount } from "svelte";
	import { Channel } from "$lib/channel.svelte";
	import Chat from "$lib/components/Chat.svelte";
	import ChatInput, { replyTarget } from "$lib/components/ChatInput.svelte";
	import { handlers } from "$lib/handlers";
	import { settings } from "$lib/settings";
	import { app } from "$lib/state.svelte";
	import type { IrcMessage } from "$lib/twitch/irc";

	const { username }: { username: string } = $props();

	let historyCursor = $state(-1);
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

	async function send(event: KeyboardEvent) {
		if (!app.active) return;

		const input = event.currentTarget as HTMLInputElement;

		if (event.key === "Escape" && replyTarget.value) {
			replyTarget.value = null;
		} else if (event.key === "ArrowUp") {
			if (!app.active.history.length) return;

			if (historyCursor === -1) {
				historyCursor = app.active.history.length - 1;
			} else if (historyCursor > 0) {
				historyCursor--;
			}

			input.value = app.active.history[historyCursor];

			setTimeout(() => {
				input.setSelectionRange(input.value.length, input.value.length);
			}, 0);
		} else if (event.key === "ArrowDown") {
			if (historyCursor === -1) return;

			if (historyCursor < app.active.history.length - 1) {
				historyCursor++;
				input.value = app.active.history[historyCursor];
			} else {
				historyCursor = -1;
				input.value = "";
			}

			input.setSelectionRange(input.value.length, input.value.length);
		} else if (event.key === "Enter") {
			event.preventDefault();

			const message = input.value.trim();

			if (!message) return;
			if (!event.ctrlKey) input.value = "";

			app.active.history.push(message);
			await app.active.send(message);

			historyCursor = -1;
			replyTarget.value = null;
		}
	}
</script>

<div class="flex h-full flex-col">
	<Chat class="grow" />

	<div class="p-2">
		<ChatInput onkeydown={send} />
	</div>
</div>
