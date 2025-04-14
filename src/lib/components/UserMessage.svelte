<script lang="ts">
	import { onMount } from "svelte";
	import type { UserMessage } from "$lib/message";
	import { app } from "$lib/state.svelte";
	import TextMessage from "./TextMessage.svelte";

	const { message }: { message: UserMessage } = $props();

	const chat = $derived(app.active.chat);

	onMount(() => {
		if (!chat.users.has(message.user.id)) {
			chat.users.set(message.user.id, message.user);
		}
	});
</script>

<div class="hover:bg-muted px-3.5 py-2">
	{#if message.isReply()}
		{@const user = chat.users.get(message.reply.parent_user_id)}

		<div class="mb-1 flex items-center gap-2">
			<div
				class="border-muted-foreground mt-1 ml-2 h-2 w-6 rounded-tl-lg border-2 border-r-0 border-b-0"
			></div>

			<div class="line-clamp-1 text-xs">
				<span style:color={user?.color}
					>@{message.reply.parent_user_name}</span
				>:
				<p class="text-muted-foreground inline">
					{message.reply.parent_message_body}
				</p>
			</div>
		</div>
	{/if}

	<TextMessage {message} />
</div>
