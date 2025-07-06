<script lang="ts">
	import type { UserMessage } from "$lib/message";
	import { settings } from "$lib/settings";
	import type { HighlightType } from "$lib/settings";
	import { app } from "$lib/state.svelte";
	import type { User } from "$lib/user.svelte";
	import QuickActions from "../QuickActions.svelte";
	import Highlight from "./Highlight.svelte";
	import Message from "./Message.svelte";

	const { message }: { message: UserMessage } = $props();

	let hlType = $state<HighlightType>();
	let info = $state<string>();
	let quickActionsOpen = $state(false);

	const highlights = $derived(settings.state.highlights);

	const customMatched = $derived(
		highlights.custom.find((hl) => {
			if (!hl.pattern.trim()) return false;

			let pattern = hl.regex ? hl.pattern : RegExp.escape(hl.pattern);

			if (hl.wholeWord) {
				pattern = `\\b${pattern}\\b`;
			}

			return new RegExp(pattern, hl.matchCase ? "g" : "gi").test(message.text);
		}),
	);

	const isSelf = message.author.id === app.user?.id;
	const hasMention = message.text.toLowerCase().includes(`@${app.user?.username}`);

	if (hasMention) {
		hlType = "mention";
	} else if (message.isFirst) {
		hlType = "new";
	} else if (message.author.isReturning) {
		hlType = "returning";
	} else if (message.author.isBroadcaster) {
		hlType = "broadcaster";
	} else if (message.author.isMod) {
		hlType = "moderator";
	} else if (message.author.isSuspicious) {
		hlType = "suspicious";
	} else if (message.author.isVip) {
		hlType = "vip";
	} else if (message.author.isSub) {
		hlType = "subscriber";
	}

	const likelihood = message.author.banEvasion;

	if (message.author.isSuspicious) {
		if (message.author.monitored) {
			info = "Montioring";
		} else if (message.author.restricted) {
			info = "Restricted";
		} else if (likelihood !== "unknown") {
			const status = likelihood[0].toUpperCase() + likelihood.slice(1);
			info = `${status} Ban Evader`;
		}
	}

	function getMentionStyle(user?: User) {
		switch (settings.state.chat.mentionStyle) {
			case "none":
				return null;
			case "colored":
				return `color: ${user?.color}`;
			case "painted":
				return user?.style;
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
	{#if quickActionsOpen && !message.deleted && !app.user?.banned}
		<QuickActions class="absolute top-0 right-2 -translate-y-1/2" {message} />
	{/if}

	{#if message.highlighted}
		<div class="bg-muted/50 my-0.5 border-l-4 p-2" style:border-color={app.joined?.user.color}>
			<Message {message} />
		</div>
	{:else if highlights.enabled}
		{#if hlType && highlights[hlType].enabled}
			<Highlight type={hlType} {info} highlight={highlights[hlType]}>
				{@render innerMessage(highlights[hlType].style !== "background")}
			</Highlight>
		{:else if customMatched?.enabled && !isSelf}
			<Highlight type="custom" highlight={customMatched}>
				{@render innerMessage(customMatched.style !== "background")}
			</Highlight>
		{:else}
			{@render innerMessage(false)}
		{/if}
	{:else}
		{@render innerMessage(false)}
	{/if}
</div>

{#snippet innerMessage(bordered: boolean)}
	<div class={["not-group-aria-disabled:hover:bg-muted/50 py-2", bordered ? "px-1.5" : "px-3"]}>
		{#if message.reply}
			{@const user = app.joined?.viewers.get(message.reply.parent.user.id)}

			<div class="mb-1 flex items-center gap-2">
				<div
					class="border-muted-foreground mt-1 ml-2 h-2 w-6 rounded-tl-lg border-2 border-r-0 border-b-0"
				></div>

				<div class="line-clamp-1 text-xs">
					<span style={getMentionStyle(user)}>
						@{message.reply.parent.user.name}
					</span>:

					<p class="text-muted-foreground inline">
						{message.reply.parent.message_text}
					</p>
				</div>
			</div>
		{/if}

		<Message {message} />
	</div>
{/snippet}
