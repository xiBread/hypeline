<script lang="ts">
	import type { UserMessage } from "$lib/message";
	import { app } from "$lib/state.svelte";
	import type { RaidEvent } from "$lib/twitch/irc";

	interface Props {
		message: UserMessage;
		raid: RaidEvent;
	}

	const { message, raid }: Props = $props();
</script>

<div class="bg-muted/50 my-0.5 border-l-4 p-2.5" style:border-color={app.active?.user.color}>
	<div class="flex items-center gap-2">
		<img
			class="size-6 rounded-full"
			src={raid.profile_image_url.replace("%s", "150x150")}
			alt={message.viewer.displayName}
		/>

		<p class="inline">
			<span class="font-semibold" style:color={message.viewer.color}>
				{message.viewer.displayName}
			</span>

			is raiding with {raid.viewer_count}
			{raid.viewer_count > 1 ? "viewers" : "viewer"}!
		</p>
	</div>
</div>
