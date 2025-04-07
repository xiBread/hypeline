<script lang="ts">
	import Settings from "@lucide/svelte/icons/settings";
	import Users from "@lucide/svelte/icons/users";
	import { ScrollArea, Tooltip } from "bits-ui";
	import type { FollowedChannel } from "$lib/twitch-api";

	const { channels }: { channels: FollowedChannel[] } = $props();
	const [self, ...following] = channels;
</script>

<ScrollArea.Root>
	<ScrollArea.Viewport class="h-full max-h-screen">
		<nav class="bg-sidebar flex h-full flex-col gap-4 border-r p-3">
			<a
				class="bg-twitch flex size-10 items-center justify-center rounded-md"
				href="/settings"
			>
				<Settings class="size-5 text-white" />
			</a>

			{@render channelIcon(self)}

			<div class="bg-border h-px" role="separator"></div>

			{#each following as channel (channel.user_id)}
				{@render channelIcon(channel)}
			{/each}
		</nav>
	</ScrollArea.Viewport>

	<ScrollArea.Scrollbar
		class={[
			"w-2 p-0.5",
			"data-[state=hidden]:fade-out-0 data-[state=visible]:fade-in-0 data-[state=visible]:animate-in data-[state=hidden]:animate-out",
		]}
		orientation="vertical"
	>
		<ScrollArea.Thumb class="bg-muted-foreground/80 rounded-full" />
	</ScrollArea.Scrollbar>
</ScrollArea.Root>

{#snippet channelIcon(channel: FollowedChannel)}
	<Tooltip.Root delayDuration={100}>
		<Tooltip.Trigger>
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
		</Tooltip.Trigger>

		<Tooltip.Portal>
			<Tooltip.Content
				class={[
					"bg-muted max-w-64 rounded-md border p-2 text-sm shadow",
					"data-[state$=open]:animate-in data-[state$=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=closed]:animate-out duration-75",
				]}
				side="right"
				sideOffset={18}
			>
				{#if channel.stream}
					<div class="space-y-0.5">
						<!-- prettier-ignore -->
						<div class="text-twitch-link overflow-ellipsis overflow-hidden whitespace-nowrap">
							{channel.user_name} &bullet; {channel.stream.game_name}
						</div>

						<p class="line-clamp-2">{channel.stream.title}</p>

						<div class="text-muted-foreground flex items-center">
							<Users class="mr-1 size-3" />

							<p class="text-xs">
								{channel.stream.viewer_count} viewers
							</p>
						</div>
					</div>
				{:else}
					{channel.user_name}
				{/if}
			</Tooltip.Content>
		</Tooltip.Portal>
	</Tooltip.Root>
{/snippet}
