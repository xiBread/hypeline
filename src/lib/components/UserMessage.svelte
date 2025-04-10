<script lang="ts">
	import * as opener from "@tauri-apps/plugin-opener";
	import { onMount } from "svelte";
	import type { UserMessage } from "$lib/chat";
	import { chat } from "$lib/state.svelte";
	// eslint-disable-next-line import/no-self-import
	import Self from "./UserMessage.svelte";

	const {
		message,
		reply,
	}: { message: UserMessage; reply?: UserMessage["reply"] } = $props();

	onMount(() => {
		if (!chat.users.has(message.chatter_user_id)) {
			chat.users.set(message.chatter_user_id, {
				id: message.chatter_user_id,
				name: message.chatter_user_name,
				color: message.color,
			});
		}
	});

	async function openUrl(url: URL) {
		await opener.openUrl(url.toString());
	}
</script>

{#if reply}
	{@const user = chat.users.get(reply.parent_user_id)}

	<div class="mb-1 flex items-center gap-2">
		<div
			class="border-muted-foreground mt-1 ml-2 h-2 w-6 rounded-tl-lg border-2 border-r-0 border-b-0"
		></div>

		<div class="line-clamp-1 inline text-xs">
			<span style:color={user?.color}>@{reply.parent_user_name}</span>:
			<p class="text-muted-foreground inline">
				{reply.parent_message_body}
			</p>
		</div>
	</div>

	<Self {message} />
{:else}
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
		{#each message.fragments as fragment, i}
			{#if fragment.type === "mention"}
				{#if !message.reply}
					{@const user = chat.users.get(fragment.id)}

					<span
						class="font-bold break-words"
						style:color={user?.color}
					>
						@{user?.name ?? fragment.username}
					</span>
				{/if}
			{:else if fragment.type === "url"}
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<span
					class="wrap-anywhere text-blue-600 underline"
					role="link"
					tabindex="-1"
					onclick={() => openUrl(fragment.url)}
				>
					{fragment.text}
				</span>
			{:else if fragment.type === "emote"}
				<img
					class="inline-block align-middle"
					title={fragment.name}
					src={fragment.url}
					alt={fragment.name}
					width={fragment.width}
					height={fragment.height}
				/>
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
{/if}
