<script lang="ts">
	import "../app.css";
	import LoaderCircle from "@lucide/svelte/icons/loader-circle";
	import { Tooltip } from "bits-ui";
	import { ModeWatcher } from "mode-watcher";
	import { onMount } from "svelte";
	import { goto } from "$app/navigation";
	import Sidebar from "$lib/components/Sidebar.svelte";
	import { settings } from "$lib/settings";
	import { app } from "$lib/state.svelte";
	import { connect } from "$lib/twitch/irc";

	const { children } = $props();

	onMount(async () => {
		app.loading = true;

		await connect();

		app.loading = false;

		if (settings.state.user && settings.state.lastJoined) {
			await goto(`/${settings.state.lastJoined}`);
		}
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
