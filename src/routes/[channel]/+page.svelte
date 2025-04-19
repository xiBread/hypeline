<script lang="ts">
	import { Channel } from "$lib/channel.svelte";
	import Chat from "$lib/components/Chat.svelte";
	import Input, { replyTarget } from "$lib/components/Input.svelte";
	import { SystemMessage } from "$lib/message";
	import { settings } from "$lib/settings.js";
	import { app } from "$lib/state.svelte";

	const { data } = $props();

	$effect(() => {
		if (app.wsSessionId) update();

		return () => app.active.leave();
	});

	async function update() {
		const channel = await Channel.join(data.channel, app.wsSessionId!);

		channel.addEmotes(app.globalEmotes);
		channel.chat.messages = [
			new SystemMessage(`Joined ${channel.user.displayName}`),
		];

		app.active = channel;
		settings.state.lastJoined = data.channel;
	}

	async function send(event: KeyboardEvent) {
		if (event.key !== "Enter") return;

		event.preventDefault();

		const input = event.currentTarget as HTMLInputElement;
		const message = input.value.trim();

		if (!message) return;
		if (!event.ctrlKey) input.value = "";

		await app.active.chat.send(message);
		replyTarget.value = null;
	}
</script>

<div class="flex h-screen flex-col">
	<Chat class="grow" />

	<div class="p-2">
		<Input onkeydown={send} />
	</div>
</div>
