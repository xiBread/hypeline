<script lang="ts">
	import { VList } from "virtua/svelte";
	import type { Message } from "$lib/message";
	import { chat } from "$lib/state.svelte";
	import NotificationMessage from "./NotificationMessage.svelte";
	import SystemMessage from "./SystemMessage.svelte";
	import UserMessage from "./UserMessage.svelte";

	interface Props {
		class?: string;
	}

	// Arbitrary; corresponds to how much of the bottom of the chat needs to be
	// visible (smaller = more, larger = less).
	const TOLERANCE = 10;

	const { class: className }: Props = $props();

	let list = $state<VList<any>>();
	let shouldAutoScroll = true;

	function handleScroll(offset: number) {
		if (!list) return;

		shouldAutoScroll =
			offset >= list.getScrollSize() - list.getViewportSize() - TOLERANCE;
	}

	$effect(() => {
		if (list && chat.messages.length && shouldAutoScroll) {
			list.scrollToIndex(chat.messages.length - 1, { align: "end" });
		}
	});
</script>

<VList
	class="{className} overflow-y-auto text-sm"
	data={chat.messages}
	onscroll={(offset) => handleScroll(offset)}
	getKey={(msg, i) => msg.message_id ?? i}
	bind:this={list}
>
	{#snippet children(message: Message)}
		<div class="my-0.5">
			{#if message.isUser()}
				<UserMessage {message} />
			{:else if message.isNotification()}
				<NotificationMessage {message} />
			{:else}
				<SystemMessage {message} />
			{/if}
		</div>
	{/snippet}
</VList>
