<script lang="ts">
	import * as opener from "@tauri-apps/plugin-opener";
	import type { UserMessage } from "$lib/message";
	import { settings } from "$lib/settings";
	import { app } from "$lib/state.svelte";
	import type { Badge } from "$lib/twitch/api";
	import Timestamp from "../Timestamp.svelte";
	import Tooltip from "../ui/Tooltip.svelte";

	const { message }: { message: UserMessage } = $props();

	const badges: Badge[] = [];

	for (const badge of message.badges) {
		const chatBadge = app.joined?.badges.get(badge.name)?.[badge.version];

		if (chatBadge) {
			badges.push(chatBadge);
		}
	}

	async function openUrl(url: URL) {
		await opener.openUrl(url.toString());
	}
</script>

<Timestamp date={message.timestamp} />

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

<!-- Formatting is ugly here, but it needs to be in order for the colon to
render properly without an extra space in between. -->
<span class="font-semibold break-words" style:color={message.viewer.color}>
	{message.viewer.displayName}
</span>{#if !message.isAction}:{/if}

<p
	class={["inline", message.isAction && "italic"]}
	style:color={message.isAction ? message.viewer.color : null}
>
	{#each message.fragments as fragment, i}
		{#if fragment.type === "mention"}
			{#if !message.reply || (message.reply && i > 0)}
				<span
					class="font-semibold break-words"
					style:color={settings.state.coloredMentions ? fragment.color : "inherit"}
				>
					@{fragment.displayName}
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
			<Tooltip triggerClass="-my-2 align-middle inline-block" side="top" sideOffset={4}>
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
