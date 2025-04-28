<script lang="ts">
	import { Channel } from "$lib/channel.svelte";
	import Chat from "$lib/components/Chat.svelte";
	import Input, { replyTarget } from "$lib/components/Input.svelte";
	import { handlers } from "$lib/handlers";
	import { settings } from "$lib/settings";
	import { app } from "$lib/state.svelte";

	const { data } = $props();

	$effect(() => {
		join();

		return () => app.active.leave();
	});

	async function join() {
		const channel = await Channel.join(data.channel);
		app.active = channel;

		channel.addEmotes(app.globalEmotes);

		for (const message of channel.recentMessages) {
			const handler = handlers.get(message.type);
			await handler?.handle(message);
		}

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
