<script lang="ts">
	import { Separator } from "bits-ui";
	import { VList } from "virtua/svelte";
	import type { Message } from "$lib/message";
	import { app } from "$lib/state.svelte";
	import AutoMod from "./message/AutoMod.svelte";
	import Notification from "./message/Notification.svelte";
	import SystemMessage from "./message/SystemMessage.svelte";
	import UserMessage from "./message/UserMessage.svelte";

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
		if (!list || !app.joined) return 0;

		const total = app.joined.messages.length - list.findEndIndex();
		return total > 99 ? "99+" : total;
	});

	$effect(() => {
		if (app.joined?.messages.length && !scrollingPaused) {
			scrollToEnd();
		}
	});

	function scrollToEnd() {
		if (app.joined) {
			list?.scrollToIndex(app.joined.messages.length - 1, { align: "end" });
		}
	}

	function handleScroll(offset: number) {
		if (!list) return;

		scrollingPaused = offset < list.getScrollSize() - list.getViewportSize() - TOLERANCE;
	}
</script>

<div class="relative h-full">
	{#if scrollingPaused}
		<button
			class="bg-muted/50 absolute bottom-0 z-10 flex h-10 w-full items-center justify-center text-sm font-medium backdrop-blur-xs"
			type="button"
			onclick={scrollToEnd}
		>
			Scrolling paused ({newMessageCount} new messages)
		</button>
	{/if}

	<VList
		class="{className} overflow-y-auto text-sm"
		data={app.joined?.messages ?? []}
		getKey={(msg: Message) => msg.id}
		onscroll={handleScroll}
		bind:this={list}
	>
		{#snippet children(message: Message, i)}
			{#if !message.isUser()}
				{/* @ts-expect-error */ null}
				<SystemMessage {message} context={message.context} />
			{:else if message.event}
				<Notification {message} />
			{:else if message.autoMod}
				<AutoMod {message} metadata={message.autoMod} />
			{:else}
				<UserMessage {message} />
			{/if}

			{@const next = app.joined?.messages.at(i + 1)}

			{#if message.isRecent && !next?.isRecent}
				<div class="text-twitch relative px-3.5">
					<Separator.Root class="my-4 h-px w-full rounded-full bg-current" />

					<div
						class="bg-background absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-2 text-xs font-semibold uppercase"
					>
						Live messages
					</div>
				</div>
			{/if}
		{/snippet}
	</VList>
</div>
