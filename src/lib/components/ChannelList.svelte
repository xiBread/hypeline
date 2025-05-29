<script lang="ts">
	import { invoke } from "@tauri-apps/api/core";
	import { listen } from "@tauri-apps/api/event";
	import type { UnlistenFn } from "@tauri-apps/api/event";
	import { onDestroy, onMount } from "svelte";
	import { flip } from "svelte/animate";
	import { settings } from "$lib/settings";
	import { app } from "$lib/state.svelte";
	import type { Stream } from "$lib/twitch/api";
	import { User } from "$lib/user";
	import Tooltip from "./ui/Tooltip.svelte";

	let unlisten: UnlistenFn | undefined;

	const groups = $derived.by(() => {
		const sorted = app.channels.toSorted((a, b) => {
			if (a.stream && b.stream) {
				return b.stream.viewer_count - a.stream.viewer_count;
			}

			if (a.stream && !b.stream) return -1;
			if (!a.stream && b.stream) return 1;

			return a.user.username.localeCompare(b.user.username);
		});

		return Object.groupBy(sorted, (channel) => (channel.ephemeral ? "a" : "b"));
	});

	onMount(async () => {
		await invoke("run_stream_update_loop", { ids: app.channels.map((c) => c.user.id) });

		unlisten = await listen<Stream[]>("streams", (event) => {
			for (const stream of event.payload) {
				const chan = app.channels.find((c) => c.user.id === stream.user_id);
				chan?.setStream(stream);
			}
		});
	});

	onDestroy(() => unlisten?.());
</script>

<!-- TODO: include stream with user -->
{#if app.user}
	{@render channelIcon(app.user, null)}
{/if}

{#each Object.entries(groups)
	.sort((a, b) => a[0].localeCompare(b[0]))
	.map((e) => e[1]) as channels}
	<div class="bg-border h-px" role="separator"></div>

	{#each channels as channel (channel.user.id)}
		<div class="flex" animate:flip={{ duration: 500 }}>
			{@render channelIcon(channel.user, channel.stream)}
		</div>
	{/each}
{/each}

{#snippet channelIcon(user: User, stream: Stream | null)}
	<Tooltip class="max-w-64" side="right" sideOffset={18}>
		{#snippet trigger()}
			<button
				class="bg-muted flex size-10 items-center justify-center overflow-hidden rounded-full border"
				type="button"
				onclick={() => {
					settings.state.lastJoined = user.username;
				}}
			>
				<img
					class={["object-cover", !stream && "grayscale"]}
					src={user.profilePictureUrl}
					alt={user.displayName}
					width="300"
					height="300"
				/>
			</button>
		{/snippet}

		{#if stream}
			<div class="space-y-0.5">
				<div class="text-twitch-link overflow-hidden overflow-ellipsis whitespace-nowrap">
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
