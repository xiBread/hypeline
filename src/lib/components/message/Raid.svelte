<script lang="ts">
	import type { UserMessage } from "$lib/message";
	import { app } from "$lib/state.svelte";
	import type { RaidEvent } from "$lib/twitch/irc";
	import Timestamp from "../Timestamp.svelte";

	interface Props {
		message: UserMessage;
		raid: RaidEvent;
	}

	const { message, raid }: Props = $props();
</script>

<div class="bg-muted/50 my-0.5 border-l-4 p-2" style:border-color={app.joined?.user.color}>
	<Timestamp date={message.timestamp} />

	<p class="inline">
		<span class="font-semibold" style:color={message.viewer.color}>
			{message.viewer.displayName}
		</span>

		is raiding with {raid.viewer_count}
		{raid.viewer_count > 1 ? "viewers" : "viewer"}!
	</p>
</div>
