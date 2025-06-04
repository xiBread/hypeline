<script lang="ts">
	import type { Snippet } from "svelte";
	import type { HighlightType, HighlightTypeSettings } from "$lib/settings";

	interface Props {
		children: Snippet;
		type: HighlightType | "custom";
		highlight: HighlightTypeSettings;
		info?: string;
	}

	const { children, type, highlight, info }: Props = $props();

	const decorations = {
		mention: { icon: "lucide--at-sign", label: "Mention" },
		new: { icon: "lucide--sparkles", label: "First Time Chat" },
		returning: { icon: "lucide--repeat", label: "Returning Chatter" },
		suspicious: { icon: "lucide--shield-alert", label: "Suspicious User" },
		broadcaster: { icon: "lucide--video", label: "Broadcaster" },
		moderator: { icon: "lucide--sword -scale-x-100", label: "Moderator" },
		subscriber: { icon: "lucide--star", label: "Subscriber" },
		vip: { icon: "lucide--gem", label: "VIP" },
		custom: { icon: "lucide--highlighter", label: "Custom" },
	};

	const decoration = $derived(decorations[type]);
</script>

{#if highlight.style !== "background"}
	<div
		class="m-1 box-border overflow-hidden rounded-md border"
		style:border-color={highlight.color}
	>
		{#if highlight.style === "default"}
			<div class="bg-muted flex items-center px-2.5 py-1.5 text-xs font-medium">
				<span class="{decoration.icon} iconify mr-2 size-4"></span>
				{decoration.label}

				{#if info}
					({info})
				{/if}
			</div>
		{/if}

		{@render children()}
	</div>
{:else}
	<div class="bg-(--highlight)/30" style:--highlight={highlight.color}>
		{@render children()}
	</div>
{/if}
