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

	const { children } = $props();

	onMount(async () => {
		await settings.start();
		app.loading = true;

		const emotes = await invoke<Emote[]>("fetch_global_emotes");

		for (const emote of emotes) {
			chat.emotes.set(emote.name, emote);
		}

		if (!app.channels.length) {
			app.channels = await invoke("get_followed_channels");
		}

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
				<Sidebar />
			{/if}

			<main class="grow">
				{@render children()}
			</main>
		</div>
	</Tooltip.Provider>
{/if}
