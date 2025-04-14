<script lang="ts">
	import { invoke } from "@tauri-apps/api/core";
	import { fetchUsers, join, leave } from "$lib/chat";
	import Chat from "$lib/components/Chat.svelte";
	import Input from "$lib/components/Input.svelte";
	import { app, chat, settings } from "$lib/state.svelte";
	import { SystemMessage } from "$lib/message";

	const { data } = $props();

	$effect(() => {
		if (app.wsSessionId) update();

		return () => leave();
	});

	async function update() {
		await join(data.channel);

		settings.state.lastJoined = data.channel;
		chat.messages = [new SystemMessage(`Joined ${data.channel}`)];

		await fetchUsers();
	}

	async function send(event: KeyboardEvent) {
		if (event.key !== "Enter") return;

		event.preventDefault();

		const input = event.currentTarget as HTMLInputElement;
		const message = input.value.trim();

		if (!message) return;
		if (!event.ctrlKey) input.value = "";

		await invoke("send_message", {
			content: message,
			broadcasterId: chat.channelId,
		});
	}
</script>

<div class="flex h-screen flex-col">
	<Chat class="grow" />

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
