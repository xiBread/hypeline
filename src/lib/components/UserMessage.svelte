<script lang="ts">
	import * as opener from "@tauri-apps/plugin-opener";
	import type { UserMessage } from "$lib/chat";
	import { chat } from "$lib/state.svelte";

	const { message }: { message: UserMessage } = $props();

	async function openUrl(url: URL) {
		await opener.openUrl(url.toString());
	}
</script>

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
