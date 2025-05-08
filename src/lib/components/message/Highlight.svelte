<script lang="ts" module>
	// eslint-disable-next-line no-use-before-define
	export type HighlightType = keyof typeof highlights;

	const highlights = {
		"first-time": {
			color: "#ff75e6",
			icon: "lucide--sparkles",
			label: "First Time Chat",
		},
		mention: {
			color: "#adadb8",
			icon: "lucide--at-sign",
			label: "Mention",
		},
		moderator: {
			color: "#00a865",
			icon: "lucide--sword -scale-x-100",
			label: "Moderator",
		},
		// raider
		subscriber: {
			color: "#528bff",
			icon: "lucide--star",
			label: "Subscriber",
		},
		// suspicious-user
		vip: {
			color: "#db00b3",
			icon: "lucide--gem",
			label: "VIP",
		},
	};
</script>

<script lang="ts">
	import type { Snippet } from "svelte";

	interface Props {
		children: Snippet;
		type: HighlightType;
	}

	const { children, type }: Props = $props();

	const highlight = $derived(highlights[type]);
</script>

<div
	class="mx-1 my-0.5 box-border overflow-hidden rounded-md border"
	style:border-color={highlight.color}
>
	<div class="bg-muted flex items-center px-2.5 py-1.5 text-xs font-medium">
		<span class="{highlight.icon} iconify mr-2 size-4"></span>
		{highlight.label}
	</div>

	{@render children()}
</div>
