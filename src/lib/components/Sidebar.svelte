<script lang="ts">
	import Settings from "@lucide/svelte/icons/settings";
	import Users from "@lucide/svelte/icons/users";
	import { ScrollArea } from "bits-ui";
	import { app } from "$lib/state.svelte";
	import type { Stream } from "$lib/twitch/api";
	import { User } from "$lib/user";
	import Tooltip from "./Tooltip.svelte";

	const self = $derived(app.user);

	const channels = $derived(
		app.user?.following.toSorted((a, b) => {
			if (a.stream && b.stream) {
				return b.stream.viewer_count - a.stream.viewer_count;
			}

			if (a.stream && !b.stream) return -1;
			if (!a.stream && b.stream) return 1;

			return a.user.username.localeCompare(b.user.username);
		}) ?? [],
	);
</script>

<ScrollArea.Root>
	<ScrollArea.Viewport class="h-screen">
		<nav class="bg-sidebar flex h-full flex-col gap-4 border-r p-3">
			<a
				class="bg-twitch flex size-10 items-center justify-center rounded-md"
				title="Settings"
				href="/settings"
			>
				<Settings class="size-5 text-white" />
			</a>

			{#if self}
				{@render channelIcon(self, null)}
			{/if}

			<div class="bg-border h-px" role="separator"></div>

			{#each channels as channel (channel.user.id)}
				{@render channelIcon(channel.user, channel.stream)}
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

{#snippet channelIcon(user: User, stream: Stream | null)}
	<Tooltip class="max-w-64" side="right" sideOffset={18}>
		{#snippet trigger()}
			<a
				class="bg-muted flex size-10 items-center justify-center overflow-hidden rounded-full border"
				href="/{user.displayName}"
			>
				<img
					class={["object-cover", !stream && "grayscale"]}
					src={user.profilePictureUrl}
					alt={user.displayName}
					width="300"
					height="300"
				/>
			</a>
		{/snippet}

		{#if stream}
			<div class="space-y-0.5">
				<!-- prettier-ignore -->
				<div class="text-twitch-link overflow-ellipsis overflow-hidden whitespace-nowrap">
							{user.displayName} &bullet; {stream.game_name}
						</div>

				<p class="line-clamp-2">{stream.title}</p>

				<div class="text-muted-foreground flex items-center">
					<Users class="mr-1 size-3" />

					<p class="text-xs">
						{stream.viewer_count} viewers
					</p>
				</div>
			</div>
		{:else}
			{user.displayName}
		{/if}
	</Tooltip>
{/snippet}
