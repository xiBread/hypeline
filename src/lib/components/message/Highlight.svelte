<script lang="ts">
	import type { Snippet } from "svelte";
	import { settings } from "$lib/settings";
	import type { HighlightType } from "$lib/settings";

	interface Props {
		children: Snippet;
		type: HighlightType;
	}

	const { children, type }: Props = $props();

	const highlights = {
		mention: {
			icon: "lucide--at-sign",
			label: "Mention",
		},
		new: {
			icon: "lucide--sparkles",
			label: "First Time Chat",
		},
		returning: {
			icon: "lucide--repeat",
			label: "Returning Chatter",
		},
		suspicious: {
			icon: "lucide--shield-alert",
			label: "Suspicious User",
		},
		broadcaster: {
			icon: "lucide--video",
			label: "Broadcaster",
		},
		moderator: {
			icon: "lucide--sword -scale-x-100",
			label: "Moderator",
		},
		subscriber: {
			icon: "lucide--star",
			label: "Subscriber",
		},
		vip: {
			icon: "lucide--gem",
			label: "VIP",
		},
	};

	const highlight = $derived(highlights[type]);
	const hlType = $derived(settings.state.highlights[type]);
</script>

{#if hlType.style !== "background"}
	<div
		class="mx-1 my-0.5 box-border overflow-hidden rounded-md border"
		style:border-color={hlType.color}
	>
		{#if hlType.style === "default"}
			<div
				class="bg-muted flex items-center px-2.5 py-1.5 text-xs font-medium"
			>
				<span class="{highlight.icon} iconify mr-2 size-4"></span>
				{highlight.label}
			</div>
		{/if}

		{@render children()}
	</div>
{:else}
	<div class="bg-(--highlight)/30" style:--highlight={hlType.color}>
		{@render children()}
	</div>
{/if}
