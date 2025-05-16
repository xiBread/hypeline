<script lang="ts">
	import type { UserMessage } from "$lib/message";
	import { settings } from "$lib/settings";
	import type { HighlightType } from "$lib/settings";
	import { app } from "$lib/state.svelte";
	import QuickActions from "../QuickActions.svelte";
	import Highlight from "./Highlight.svelte";
	import Message from "./Message.svelte";

	const { message }: { message: UserMessage } = $props();

	let hlType = $state<HighlightType>();
	let info = $state<string>();
	let quickActionsOpen = $state(false);

	const highlights = $derived(settings.state.highlights);

	const hasMention = message.text.toLowerCase().includes(`@${app.user?.username}`);

	if (hasMention) {
		hlType = "mention";
	} else if (message.isFirst) {
		hlType = "new";
	} else if (message.viewer.isReturning) {
		hlType = "returning";
	} else if (message.viewer.isBroadcaster) {
		hlType = "broadcaster";
	} else if (message.viewer.isMod) {
		hlType = "moderator";
	} else if (message.viewer.isSuspicious) {
		hlType = "suspicious";
	} else if (message.viewer.isVip) {
		hlType = "vip";
	} else if (message.viewer.isSub) {
		hlType = "subscriber";
	}

	const likelihood = message.viewer.banEvasion;

	if (message.viewer.isSuspicious) {
		if (message.viewer.monitored) {
			info = "Montioring";
		} else if (message.viewer.restricted) {
			info = "Restricted";
		} else if (likelihood !== "unknown") {
			const status = likelihood[0].toUpperCase() + likelihood.slice(1);
			info = `${status} Ban Evader`;
		}
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class={["group relative", message.deleted && "opacity-30"]}
	onmouseenter={() => (quickActionsOpen = true)}
	onmouseleave={() => (quickActionsOpen = false)}
	aria-disabled={message.deleted}
>
	{#if quickActionsOpen && !message.deleted}
		<QuickActions class="absolute top-0 right-2 -translate-y-1/2" {message} />
	{/if}

	{#if message.highlighted}
		<div class="bg-muted/50 my-0.5 border-l-4 p-2" style:border-color={app.joined?.user.color}>
			<Message {message} />
		</div>
	{:else if hlType && highlights.enabled && highlights[hlType].enabled}
		<Highlight type={hlType} {info}>
			{@render innerMessage(highlights[hlType].style !== "background")}
		</Highlight>
	{:else}
		{@render innerMessage(false)}
	{/if}
</div>

{#snippet innerMessage(bordered: boolean)}
	<div class={["not-group-aria-disabled:hover:bg-muted/50 py-2", bordered ? "px-1.5" : "px-3"]}>
		{#if message.reply}
			{@const viewer = app.joined?.viewers.get(message.reply.parent.user.login)}

			<div class="mb-1 flex items-center gap-2">
				<div
					class="border-muted-foreground mt-1 ml-2 h-2 w-6 rounded-tl-lg border-2 border-r-0 border-b-0"
				></div>

				<div class="line-clamp-1 text-xs">
					<span style={settings.state.coloredMentions ? viewer?.style : "inherit"}
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
