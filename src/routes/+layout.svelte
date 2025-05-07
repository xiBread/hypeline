<script lang="ts">
	import "../app.css";
	import { Tooltip } from "bits-ui";
	import { ModeWatcher } from "mode-watcher";
	import { onMount } from "svelte";
	import { goto } from "$app/navigation";
	import Sidebar from "$lib/components/Sidebar.svelte";
	import { settings } from "$lib/settings";
	import { connect } from "$lib/twitch";

	const { children } = $props();

	onMount(async () => {
		if (settings.state.user) {
			await connect();
		}

		if (settings.state.user && settings.state.lastJoined) {
			await goto(`/${settings.state.lastJoined}`);
		}
	});
</script>

<ModeWatcher />

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
