<script lang="ts" module>
	import { settings } from "$lib/settings";

	// eslint-disable-next-line no-use-before-define
	export type HighlightType = keyof typeof highlights;

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
</script>

<script lang="ts">
	import type { Snippet } from "svelte";

	interface Props {
		children: Snippet;
		type: HighlightType;
	}

	const { children, type }: Props = $props();

	const highlight = $derived(highlights[type]);
	const hlType = $derived(settings.state.highlights[type]);
</script>

<div
	class="mx-1 my-0.5 box-border overflow-hidden rounded-md border"
	style:border-color={hlType.color}
>
	<div class="bg-muted flex items-center px-2.5 py-1.5 text-xs font-medium">
		<span class="{highlight.icon} iconify mr-2 size-4"></span>
		{highlight.label}
	</div>

	{@render children()}
</div>
