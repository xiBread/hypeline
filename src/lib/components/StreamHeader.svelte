<script lang="ts">
	import type { Stream } from "$lib/twitch/api";

	const { stream }: { stream: Stream } = $props();
</script>

<div
	class="bg-sidebar text-muted-foreground flex items-center gap-2 overflow-hidden border-b p-2 text-xs"
>
	<div class="flex shrink-0 items-center">
		<span class="iconify lucide--users mr-1"></span>
		<span class="font-medium">{stream.viewer_count}</span>
	</div>
	&bullet;
	<p class="line-clamp-1">{stream.title}</p>
</div>
