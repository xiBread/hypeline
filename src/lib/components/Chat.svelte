<script module lang="ts">
	import * as opener from "@tauri-apps/plugin-opener";
	import type { Fragment } from "$lib/chat";
	import type { ChannelChatMessage } from "$lib/twitch-api";

	export interface Message extends ChannelChatMessage {
		fragments: Fragment[];
	}
</script>

<script lang="ts">
	import { onMount } from "svelte";
	import { chat } from "$lib/state.svelte";

	interface Props {
		class?: string;
		messages: Message[];
	}

	// Arbitrary; corresponds to how much of the bottom of the chat needs to be
	// visible (smaller = more, larger = less).
	const SCROLL_PADDING = 10;

	const { class: className, messages }: Props = $props();

	let view = $state<HTMLElement>();
	let shouldAutoScroll = true;

	onMount(() => {
		if (view) {
			view.addEventListener("scroll", handleScroll);
		}

		return () => view?.removeEventListener("scroll", handleScroll);
	});

	async function openUrl(url: URL) {
		await opener.openUrl(url.toString());
	}

	function handleScroll() {
		if (view) {
			shouldAutoScroll =
				view.scrollTop >=
				view.scrollHeight - view.clientHeight - SCROLL_PADDING;
		}
	}

	$effect(() => {
		if (view && messages.length > 0 && shouldAutoScroll) {
			view.scrollTop = view.scrollHeight;
		}
	});
</script>

<div class="{className} flex flex-col overflow-y-auto text-sm" bind:this={view}>
	{#each messages as message}
		<div class="p-2">
			{#if message.badges.length}
				<div class="inline-block space-x-1">
					{#each message.badges as { id, set_id } (set_id)}
						{@const badges = chat.badges.get(set_id)}

						{#if badges && badges[id]}
							{@const badge = badges[id]}

							<img
								class="inline-block align-middle"
								title={badge.title}
								src={badge.image_url_2x}
								alt={badge.description}
								width="18"
								height="18"
							/>
						{/if}
					{/each}
				</div>
			{/if}

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
							class="wrap-anywhere text-blue-600 underline"
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
						<span class="wrap-anywhere">
							{frag.value}
						</span>
					{/if}

					{#if i < message.fragments.length - 1}
						<!-- eslint-disable-next-line svelte/no-useless-mustaches -->
						<span>{" "}</span>
					{/if}
				{/each}
			</p>
		</div>
	{/each}
</div>
