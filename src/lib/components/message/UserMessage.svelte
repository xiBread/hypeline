<script lang="ts">
	import type { UserMessage } from "$lib/message";
	import { settings } from "$lib/settings";
	import { app } from "$lib/state.svelte";
	import QuickActions from "../QuickActions.svelte";
	import Highlight from "./Highlight.svelte";
	import type { HighlightType } from "./Highlight.svelte";
	import Message from "./Message.svelte";

	const { message }: { message: UserMessage } = $props();

	let highlightType = $state<HighlightType>();
	let quickActionsOpen = $state(false);

	const hasMention = message.text
		.toLowerCase()
		.includes(`@${app.user?.username}`);

	if (hasMention) {
		highlightType = "mention";
	} else if (message.isFirst) {
		highlightType = "new";
	} else if (message.viewer.isMod) {
		highlightType = "moderator";
	} else if (message.viewer.isVip) {
		highlightType = "vip";
	} else if (message.viewer.isSub) {
		highlightType = "subscriber";
	} else {
		//
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class={["group group relative", message.deleted && "opacity-30"]}
	onmouseenter={() => (quickActionsOpen = true)}
	onmouseleave={() => (quickActionsOpen = false)}
	aria-disabled={message.deleted}
>
	{#if quickActionsOpen && !message.deleted}
		<QuickActions
			class="absolute top-0 right-2 -translate-y-1/2"
			{message}
		/>
	{/if}

	{#if message.highlighted}
		<div
			class="bg-muted/50 my-0.5 border-l-4 p-2.5"
			style:border-color={app.active.user.color}
		>
			<Message {message} />
		</div>
	{:else if highlightType && settings.state.highlights.enabled}
		<Highlight type={highlightType}>
			{@render innerMessage(true)}
		</Highlight>
	{:else}
		{@render innerMessage(false)}
	{/if}
</div>

{#snippet innerMessage(highlighted: boolean)}
	<div
		class={[
			"not-group-aria-disabled:hover:bg-muted/50 py-2",
			highlighted ? "px-1.5" : "px-3",
		]}
	>
		{#if message.reply}
			{@const viewer = app.active.viewers.get(
				message.reply.parent.user.login,
			)}

			<div class="mb-1 flex items-center gap-2">
				<div
					class="border-muted-foreground mt-1 ml-2 h-2 w-6 rounded-tl-lg border-2 border-r-0 border-b-0"
				></div>

				<div class="line-clamp-1 text-xs">
					<span style:color={viewer?.color}
						>@{message.reply.parent.user.name}</span
					>:
					<p class="text-muted-foreground inline">
						{message.reply.parent.message_text}
					</p>
				</div>
			</div>
		{/if}

		<Message {message} />
	</div>
{/snippet}
