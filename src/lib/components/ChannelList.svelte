<script lang="ts">
	import { ScrollArea } from "bits-ui";
	import type { FollowedChannel } from "$lib/twitch-api";

	const { channels }: { channels: FollowedChannel[] } = $props();
	const [self, ...following] = channels;
</script>

<ScrollArea.Root>
	<ScrollArea.Viewport class="h-full max-h-screen">
		<aside class="bg-sidebar flex flex-col gap-4 border-r p-4">
			{@render channelIcon(self)}

			<div class="bg-border h-px" role="separator"></div>

			{#each following as channel (channel.user_id)}
				{@render channelIcon(channel)}
			{/each}
		</aside>
	</ScrollArea.Viewport>

	<ScrollArea.Scrollbar
		class="data-[state=hidden]:fade-out-0 data-[state=visible]:fade-in-0 data-[state=visible]:animate-in data-[state=hidden]:animate-out w-2 p-0.5"
		orientation="vertical"
	>
		<ScrollArea.Thumb class="bg-muted-foreground/80 rounded-full" />
	</ScrollArea.Scrollbar>
</ScrollArea.Root>

{#snippet channelIcon(channel: FollowedChannel)}
	<a
		class="bg-muted flex size-10 items-center justify-center overflow-hidden rounded-full border"
		href="/{channel.user_login}"
	>
		<img
			class={["object-cover", !channel.stream && "grayscale"]}
			src={channel.profile_image_url}
			alt={channel.user_name}
			width="300"
			height="300"
		/>
	</a>
{/snippet}
