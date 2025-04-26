<script lang="ts">
	import Users from "@lucide/svelte/icons/users";
	import { invoke } from "@tauri-apps/api/core";
	import { onMount } from "svelte";
	import { Channel } from "$lib/channel.svelte";
	import { app } from "$lib/state.svelte";
	import type { FullChannel } from "$lib/tauri";
	import type { Stream } from "$lib/twitch/api";
	import { User } from "$lib/user";
	import Tooltip from "./Tooltip.svelte";

	let followed = $state<Channel[]>([]);

	onMount(async () => {
		followed = await fetchFollowed();
	});

	async function fetchFollowed() {
		const channels = await invoke<FullChannel[]>("get_followed_channels");
		const followed = [];

		for (const channel of channels) {
			const user = new User(channel.user);
			const chan = new Channel(user, channel.stream);

			followed.push(chan);
		}

		followed.sort((a, b) => {
			if (a.stream && b.stream) {
				return b.stream.viewer_count - a.stream.viewer_count;
			}

			if (a.stream && !b.stream) return -1;
			if (!a.stream && b.stream) return 1;

			return a.user.username.localeCompare(b.user.username);
		});

		return followed;
	}
</script>

<!-- todo: include stream with user -->
{#if app.user}
	{@render channelIcon(app.user, null)}
{/if}

<div class="bg-border h-px" role="separator"></div>

{#each followed as channel (channel.user.id)}
	{@render channelIcon(channel.user, channel.stream)}
{/each}

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
				<div
					class="text-twitch-link overflow-hidden overflow-ellipsis whitespace-nowrap"
				>
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
