<script lang="ts">
	import { app } from "$lib/state.svelte";
	import { UserMessage } from "../../message";
	import Timestamp from "../Timestamp.svelte";
	import Message from "./Message.svelte";
	import Sub from "./Sub.svelte";

	const { message }: { message: UserMessage } = $props();

	const primary = app.joined?.user.color ?? "inherit";

	const colors: Record<string, string[]> = {
		PRIMARY: [primary, primary],
		BLUE: ["#00d6d6", "#9146ff"],
		GREEN: ["#00db84", "#57bee6"],
		ORANGE: ["#ffb31a", "#e0e000"],
		PURPLE: ["#9146ff", "#ff75e6"],
	};
</script>

{#if message.event}
	{@const { type } = message.event}

	{#if type === "announcement"}
		{@const stops = colors[message.event.color]}

		<div
			class="my-1 border-x-6 [border-image-slice:1]"
			style:border-image-source="linear-gradient({stops[0]}, {stops[1]})"
		>
			<div class="bg-muted flex items-center px-2.5 py-1.5 text-xs font-medium">
				<span class="iconify lucide--megaphone mr-2 size-4"></span> Announcement
			</div>

			<div class="bg-muted/50 p-1.5">
				<Message {message} />
			</div>
		</div>
	{:else if type === "bits_badge_tier"}
		<div class="bg-muted/50 my-0.5 border-l-4 p-2" style:border-color={app.joined?.user.color}>
			<div class="flex gap-1">
				<span class="iconify lucide--party-popper mt-px size-4 shrink-0"></span>

				<p>
					<span class="font-semibold" style:color={message.author.color}>
						{message.author.displayName}
					</span>
					unlocked the {message.event.threshold} bits badge!
				</p>
			</div>

			{#if message.data.message_text}
				<div class="mt-2">
					<Message {message} />
				</div>
			{/if}
		</div>
	{:else if type === "raid"}
		<div class="bg-muted/50 my-0.5 border-l-4 p-2" style:border-color={app.joined?.user.color}>
			<Timestamp date={message.timestamp} />

			<p class="inline">
				<span class="font-semibold" style:color={message.author.color}>
					{message.author.displayName}
				</span>

				is raiding with {message.event.viewer_count}
				{message.event.viewer_count > 1 ? "viewers" : "viewer"}!
			</p>
		</div>
	{:else if type === "sub_or_resub" || type === "sub_mystery_gift" || type === "sub_gift"}
		<Sub {message} sub={message.event} />
	{/if}
{/if}
