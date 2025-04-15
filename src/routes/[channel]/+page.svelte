<script lang="ts">
	import { Channel } from "$lib/channel.svelte";
	import Chat from "$lib/components/Chat.svelte";
	import Input from "$lib/components/Input.svelte";
	import { SystemMessage } from "$lib/message";
	import { app, settings } from "$lib/state.svelte";

	const { data } = $props();

	$effect(() => {
		if (app.wsSessionId) update();

		return () => app.active.leave();
	});

	async function update() {
		const channel = await Channel.join(data.channel, app.wsSessionId!);

		channel.addEmotes(app.globalEmotes);
		channel.chat.messages = [new SystemMessage(`Joined ${data.channel}`)];

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

		app.active.chat.send(message);
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
