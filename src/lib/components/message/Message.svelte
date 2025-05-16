<script lang="ts">
	import * as opener from "@tauri-apps/plugin-opener";
	import type { UserMessage } from "$lib/message";
	import { settings } from "$lib/settings";
	import { app } from "$lib/state.svelte";
	import type { Badge } from "$lib/twitch/api";
	import Timestamp from "../Timestamp.svelte";
	import Tooltip from "../ui/Tooltip.svelte";

	const { message }: { message: UserMessage } = $props();

	const fragments = message.toFragments();
	const badges = $state<Badge[]>([]);

	for (const badge of message.badges) {
		const chatBadge = app.joined?.badges.get(badge.name)?.[badge.version];
		const globalBadge = app.globalBadges.get(badge.name)?.[badge.version];

		const resolved = chatBadge ?? globalBadge;

		if (resolved) {
			badges.push(resolved);
		}
	}

	if (message.viewer.badge) {
		badges.push(message.viewer.badge);
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
<span class="font-semibold break-words" style={message.viewer.style}>
	{message.viewer.displayName}
</span>{#if !message.isAction}:{/if}

<p
	class={["inline", message.isAction && "italic"]}
	style:color={message.isAction ? message.viewer.color : null}
>
	{#each fragments as fragment, i}
		{#if fragment.type === "mention"}
			{#if !message.reply || (message.reply && i > 0)}
				<svelte:element
					this={fragment.marked ? "mark" : "span"}
					class="font-semibold break-words"
					style:color={fragment.marked
						? null
						: settings.state.coloredMentions
							? fragment.color
							: "inherit"}
				>
					@{fragment.displayName}
				</svelte:element>
			{/if}
		{:else if fragment.type === "url"}
			<svelte:element
				this={fragment.marked ? "mark" : "span"}
				class={[
					"wrap-anywhere underline hover:cursor-pointer",
					!fragment.marked && "text-twitch-link",
				]}
				role="link"
				tabindex="-1"
				onclick={() => openUrl(fragment.url)}
			>
				{fragment.text}
			</svelte:element>
		{:else if fragment.type === "cheermote"}
			{#if fragment.marked}
				<mark class="wrap-anywhere">{fragment.prefix + fragment.bits}</mark>
			{:else}
				<img
					class="-my-2 inline-block align-middle"
					src={fragment.images.dark.animated["2"]}
					alt="{fragment.prefix} {fragment.bits}"
					width="32"
					height="32"
				/>

				<span class="font-semibold" style:color={fragment.color}>{fragment.bits}</span>
			{/if}
		{:else if fragment.type === "emote"}
			{#if fragment.marked}
				<mark class="wrap-anywhere">{fragment.name}</mark>
			{:else}
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
			{/if}
		{:else}
			<svelte:element this={fragment.marked ? "mark" : "span"} class="wrap-anywhere">
				{fragment.value}
			</svelte:element>
		{/if}

		{#if i < fragments.length - 1}
			<!-- eslint-disable-next-line svelte/no-useless-mustaches -->
			<span>{" "}</span>
		{/if}
	{/each}
</p>

<style>
	mark {
		color: white;
		background-color: --alpha(var(--color-red-500) / 40%);
	}
</style>
