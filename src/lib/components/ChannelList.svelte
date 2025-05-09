<script lang="ts">
	import { invoke } from "@tauri-apps/api/core";
	import { listen } from "@tauri-apps/api/event";
	import type { UnlistenFn } from "@tauri-apps/api/event";
	import { onDestroy, onMount } from "svelte";
	import { flip } from "svelte/animate";
	import { Channel } from "$lib/channel.svelte";
	import { app } from "$lib/state.svelte";
	import type { FullChannel } from "$lib/tauri";
	import type { Stream } from "$lib/twitch/api";
	import { User } from "$lib/user";
	import Tooltip from "./ui/Tooltip.svelte";

	let unlisten: UnlistenFn | undefined;

	let followed = $state<Channel[]>([]);
	const sorted = $derived(
		followed.toSorted((a, b) => {
			if (a.stream && b.stream) {
				return b.stream.viewer_count - a.stream.viewer_count;
			}

			if (a.stream && !b.stream) return -1;
			if (!a.stream && b.stream) return 1;

			return a.user.username.localeCompare(b.user.username);
		}),
	);

	onMount(async () => {
		followed = await fetchFollowed();
		await invoke("run_following_update_loop");

		unlisten = await listen<FullChannel[]>("followedchannels", (event) => {
			for (const channel of event.payload) {
				const chan = followed.find(
					(f) => f.user.id === channel.user.data.id,
				);

				chan?.setStream(channel.stream);
			}
		});
	});

	onDestroy(() => unlisten?.());

	async function fetchFollowed() {
		const channels = await invoke<FullChannel[]>("get_followed_channels");
		const followed = [];

		for (const channel of channels) {
			const user = new User(channel.user);
			const chan = new Channel(user, channel.stream);

			followed.push(chan);
		}

		return followed;
	}
</script>

<!-- todo: include stream with user -->
{#if app.user}
	{@render channelIcon(app.user, null)}
{/if}

<div class="bg-border h-px" role="separator"></div>

{#each sorted as channel (channel.user.id)}
	<div animate:flip={{ duration: 500 }}>
		{@render channelIcon(channel.user, channel.stream)}
	</div>
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
					<span class="lucide--user iconify mr-1 size-3"></span>

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
