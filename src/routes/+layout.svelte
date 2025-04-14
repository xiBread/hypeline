<script lang="ts">
	import "../app.css";
	import LoaderCircle from "@lucide/svelte/icons/loader-circle";
	import { invoke } from "@tauri-apps/api/core";
	import { Tooltip } from "bits-ui";
	import { ModeWatcher } from "mode-watcher";
	import { onDestroy, onMount } from "svelte";
	import { goto } from "$app/navigation";
	import Sidebar from "$lib/components/Sidebar.svelte";
	import { app, settings } from "$lib/state.svelte";
	import { connect } from "$lib/twitch/eventsub";

	const { children } = $props();

	onMount(async () => {
		app.loading = true;

		await connect();

		if (!app.channels.length) {
			app.channels = await invoke("get_followed");
		}

		app.loading = false;

		if (settings.state.user && settings.state.lastJoined) {
			await goto(`/${settings.state.lastJoined}`);
		}
	});

	onDestroy(async () => {
		await app.ws?.disconnect();
	});
</script>

<ModeWatcher />

{#if app.loading}
	<div class="flex h-screen w-screen items-center justify-center">
		<LoaderCircle class="mr-2 size-6 animate-spin" />
		<span class="text-lg">Loading...</span>
	</div>
{:else}
	<Tooltip.Provider delayDuration={99}>
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
