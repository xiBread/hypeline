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
	const TOLERANCE = 15;

	const { class: className }: Props = $props();

	let list = $state<VList<any>>();
	let scrollingPaused = $state(false);

	const newMessageCount = $derived.by(() => {
		if (!list) return 0;

		const total = chat.messages.length - list.findEndIndex();
		return total > 99 ? "99+" : total;
	});

	$effect(() => {
		if (chat.messages.length && !scrollingPaused) {
			scrollToEnd();
		}
	});

	function scrollToEnd() {
		list?.scrollToIndex(chat.messages.length - 1, { align: "end" });
	}

	function handleScroll(offset: number) {
		if (!list) return;

		scrollingPaused =
			offset < list.getScrollSize() - list.getViewportSize() - TOLERANCE;
	}
</script>

<div class="relative h-full">
	{#if scrollingPaused}
		<button
			class="bg-muted/50 absolute bottom-0 z-10 flex h-10 w-full items-center justify-center text-sm font-medium backdrop-blur-xs hover:cursor-pointer"
			type="button"
			onclick={scrollToEnd}
		>
			Scrolling paused ({newMessageCount} new messages)
		</button>
	{/if}

	<VList
		class="{className} overflow-y-auto text-sm"
		data={chat.messages}
		getKey={(msg, i) => msg.message_id ?? i}
		onscroll={handleScroll}
		bind:this={list}
	>
		{#snippet children(message: Message)}
			{#if message.isUser()}
				<UserMessage {message} />
			{:else if message.isNotification()}
				<NotificationMessage {message} />
			{:else}
				<SystemMessage {message} />
			{/if}
		{/snippet}
	</VList>
</div>
