<script lang="ts">
	import { onMount } from "svelte";
	import { chat } from "$lib/state.svelte";
	import SystemMessage from "./SystemMessage.svelte";
	import UserMessage from "./UserMessage.svelte";

	interface Props {
		class?: string;
	}

	// Arbitrary; corresponds to how much of the bottom of the chat needs to be
	// visible (smaller = more, larger = less).
	const SCROLL_PADDING = 10;

	const { class: className }: Props = $props();

	let view = $state<HTMLElement>();
	let shouldAutoScroll = true;

	onMount(() => {
		if (view) {
			view.addEventListener("scroll", handleScroll);
		}

		return () => view?.removeEventListener("scroll", handleScroll);
	});

	function handleScroll() {
		if (view) {
			shouldAutoScroll =
				view.scrollTop >=
				view.scrollHeight - view.clientHeight - SCROLL_PADDING;
		}
	}

	$effect(() => {
		if (view && chat.messages.length > 0 && shouldAutoScroll) {
			view.scrollTop = view.scrollHeight;
		}
	});
</script>

<div
	class="{className} flex flex-col overflow-y-auto p-1.5 text-sm"
	bind:this={view}
>
	{#each chat.messages as message}
		<div class="hover:bg-muted rounded-md p-2">
			{#if message.type === "system"}
				<SystemMessage {message} />
			{:else}
				<UserMessage {message} reply={message.reply} />
			{/if}
		</div>
	{/each}
</div>
