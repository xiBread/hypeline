<script lang="ts">
	import "../app.css";
	import LoaderCircle from "@lucide/svelte/icons/loader-circle";
	import { invoke } from "@tauri-apps/api/core";
	import { Tooltip } from "bits-ui";
	import { ModeWatcher } from "mode-watcher";
	import { onMount } from "svelte";
	import type { Emote } from "$lib/chat";
	import Sidebar from "$lib/components/Sidebar.svelte";
	import { app, chat, settings } from "$lib/state.svelte";
	import type { FollowedChannel } from "$lib/twitch-api";

	const { children } = $props();

	let channels = $state<FollowedChannel[]>([]);

	onMount(async () => {
		await settings.start();
		app.loading = true;

		const emotes = await invoke<Emote[]>("fetch_global_emotes");

		for (const emote of emotes) {
			chat.emotes.set(emote.name, emote);
		}

		// fixme: race condition after initial auth
		channels = await invoke<FollowedChannel[]>("get_followed_channels");

		// Sort online by viewer count, then offline by name
		channels.sort((a, b) => {
			if (a.stream && b.stream) {
				return b.stream.viewer_count - a.stream.viewer_count;
			}

			if (a.stream && !b.stream) return -1;
			if (!a.stream && b.stream) return 1;

			return a.user_name.localeCompare(b.user_name);
		});

		app.loading = false;
	});
</script>

<ModeWatcher />

{#if app.loading}
	<div class="flex h-screen w-screen items-center justify-center">
		<LoaderCircle class="mr-2 size-6 animate-spin" />
		<span class="text-lg">Loading...</span>
	</div>
{:else}
	<Tooltip.Provider delayDuration={100}>
		<div class="flex">
			{#if settings.state.user}
				<Sidebar {channels} />
			{/if}

			<main class="grow">
				{@render children()}
			</main>
		</div>
	</Tooltip.Provider>
{/if}
