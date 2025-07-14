<script lang="ts">
	import dayjs from "dayjs";
	import duration from "dayjs/plugin/duration";
	import { onMount } from "svelte";
	import type { Stream } from "$lib/twitch/api";

	dayjs.extend(duration);

	const { stream }: { stream: Stream } = $props();

	let uptime = $state(getUptime());

	onMount(() => {
		const interval = setInterval(() => {
			uptime = getUptime();
		}, 1000);

		return () => clearInterval(interval);
	});

	function getUptime() {
		return dayjs.duration(dayjs().diff(dayjs(stream.started_at))).format("HH:mm:ss");
	}
</script>

<div
	class="bg-sidebar text-muted-foreground flex items-center gap-2 overflow-hidden border-b p-2 text-xs"
>
	<p class="line-clamp-1 truncate">{stream.title}</p>
	&bullet;
	<div class="flex shrink-0 items-center">
		<span class="iconify lucide--users mr-1"></span>
		<span class="font-medium">{stream.viewer_count}</span>
	</div>
	&bullet;
	<div class="flex shrink-0 items-center">
		<span class="iconify lucide--clock mr-1"></span>
		<span class="font-medium tabular-nums">{uptime}</span>
	</div>
</div>
