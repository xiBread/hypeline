<script module lang="ts">
	import * as opener from "@tauri-apps/plugin-opener";
	import type { Message } from "$lib/twitch-api";

	export interface ChatMessage extends Message {
		fragments: Fragment[];
	}
</script>

<script lang="ts">
	import type { Fragment } from "$lib/chat";
	import { onMount } from "svelte";

	interface Props {
		class?: string;
		messages: ChatMessage[];
	}

	// Arbitrary; corresponds to how much of the bottom of the chat needs to be
	// visible (smaller = more, larger = less).
	const SCROLL_PADDING = 10;

	const { class: className, messages }: Props = $props();

	let chat = $state<HTMLElement>();
	let shouldAutoScroll = true;

	onMount(() => {
		if (chat) {
			chat.addEventListener("scroll", handleScroll);
		}

		return () => chat?.removeEventListener("scroll", handleScroll);
	});

	async function openUrl(url: URL) {
		await opener.openUrl(url.toString());
	}

	function handleScroll() {
		if (chat) {
			shouldAutoScroll =
				chat.scrollTop >=
				chat.scrollHeight - chat.clientHeight - SCROLL_PADDING;
		}
	}

	$effect(() => {
		if (chat && messages.length > 0 && shouldAutoScroll) {
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

			<p class="inline">
				{#each message.fragments as frag, i}
					{#if frag.type === "mention"}
						<span class="font-bold break-words">{frag.value}</span>
					{:else if frag.type === "url"}
						<!-- svelte-ignore a11y_click_events_have_key_events -->
						<span
							class="text-blue-600 underline"
							role="link"
							tabindex="-1"
							onclick={() => openUrl(frag.url)}
						>
							{frag.text}
						</span>
					{:else if frag.type === "emote"}
						<img
							class="inline-block align-middle"
							title={frag.name}
							src={frag.url}
							alt={frag.name}
							width={frag.width}
							height={frag.height}
						/>
					{:else}
						<span>{frag.value}</span>
					{/if}

					{#if i < message.fragments.length - 1}
						<span>{" "}</span>
					{/if}
				{/each}
			</p>
		</div>
	{/each}
</div>
