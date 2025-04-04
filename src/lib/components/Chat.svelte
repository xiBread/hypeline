<script lang="ts">
	import type { Message } from "$lib/twitch-api";

	interface Props {
		class?: string;
		messages: Message[];
	}

	const { class: className, messages }: Props = $props();

	let chat = $state<HTMLElement>();

	$effect(() => {
		if (chat && messages.length > 0) {
			chat.scrollTop = chat.scrollHeight;
		}
	});
</script>

<div class="{className} flex flex-col overflow-y-auto" bind:this={chat}>
	{#each messages as message}
		<div class="p-2">
			<!-- prettier-ignore -->
			<span class="font-medium break-words" style:color={message.color}>
				{message.chatter_user_name}<span class="text-foreground">:</span>
			</span>

			<p class="inline">{message.message.text}</p>
		</div>
	{/each}
</div>
