<script lang="ts">
	import { VList } from "virtua/svelte";
	import { chat } from "$lib/state.svelte";
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
		if (list) {
			shouldAutoScroll =
				offset >=
				list.getScrollSize() - list.getViewportSize() - TOLERANCE;
		}
	}

	$effect(() => {
		if (list && chat.messages.length && shouldAutoScroll) {
			list.scrollToIndex(chat.messages.length - 1, { align: "end" });
		}
	});
</script>

<VList
	class="{className} flex flex-col overflow-y-auto p-1.5 text-sm"
	data={chat.messages}
	onscroll={(offset) => handleScroll(offset)}
	getKey={(msg, i) => msg.message_id ?? i}
	bind:this={list}
>
	{#snippet children(message)}
		<div class="hover:bg-muted rounded-md p-2">
			{#if message.type === "system"}
				<SystemMessage {message} />
			{:else}
				<UserMessage {message} reply={message.reply} />
			{/if}
		</div>
	{/snippet}
</VList>
