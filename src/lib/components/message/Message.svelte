<script lang="ts">
	import * as opener from "@tauri-apps/plugin-opener";
	import type { UserMessage } from "$lib/message";
	import { app } from "$lib/state.svelte";
	import type { Badge } from "$lib/twitch/api";
	import Tooltip from "../Tooltip.svelte";

	const { message }: { message: UserMessage } = $props();

	const badges: Badge[] = [];

	for (const badge of message.badges) {
		const chatBadge = app.active.badges.get(badge.set_id)?.[badge.id];

		if (chatBadge) {
			badges.push(chatBadge);
		}
	}

	async function openUrl(url: URL) {
		await opener.openUrl(url.toString());
	}
</script>

<time
	class="text-muted-foreground text-xs"
	datetime={message.timestamp.toISOString()}
>
	{message.formattedTime}
</time>

{#each badges as badge (badge.title)}
	<Tooltip class="p-1 text-xs" side="top" sideOffset={4}>
		{#snippet trigger()}
			<img
				class="inline-block align-middle"
				src={badge.image_url_2x}
				alt={badge.description}
				width="18"
				height="18"
			/>
		{/snippet}

		{badge.title}
	</Tooltip>
{/each}

<span class="font-medium break-words" style:color={message.user.color}>
	{message.user.displayName}<span class="text-foreground">:</span>
</span>

<p
	class={["inline", message.isAction && "italic"]}
	style:color={message.isAction ? message.user.color : null}
>
	{#each message.fragments as fragment, i}
		{#if fragment.type === "mention"}
			{#if !message.reply}
				{@const user = app.active.users.get(fragment.id)}

				<span class="font-bold break-words" style:color={user?.color}>
					@{(user ?? fragment).displayName}
				</span>
			{/if}
		{:else if fragment.type === "url"}
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<span
				class="wrap-anywhere text-blue-600 underline hover:cursor-pointer"
				role="link"
				tabindex="-1"
				onclick={() => openUrl(fragment.url)}
			>
				{fragment.text}
			</span>
		{:else if fragment.type === "emote"}
			<Tooltip
				triggerClass="-my-2 align-middle inline-block"
				side="top"
				sideOffset={4}
			>
				{#snippet trigger()}
					<img
						class="object-contain"
						src={fragment.url}
						alt={fragment.name}
						width={fragment.width}
						height={fragment.height}
					/>
				{/snippet}

				<div class="flex flex-col items-center">
					<img
						class="mb-1"
						src={fragment.url}
						alt={fragment.name}
						width={fragment.width * 2}
						height={fragment.height * 2}
					/>

					{fragment.name}
				</div>
			</Tooltip>
		{:else}
			<span class="wrap-anywhere">
				{fragment.value}
			</span>
		{/if}

		{#if i < message.fragments.length - 1}
			<!-- eslint-disable-next-line svelte/no-useless-mustaches -->
			<span>{" "}</span>
		{/if}
	{/each}
</p>
