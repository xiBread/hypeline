<script lang="ts">
	import "../app.css";
	import { Tooltip } from "bits-ui";
	import { ModeWatcher } from "mode-watcher";
	import Sidebar from "$lib/components/Sidebar.svelte";
	import { settings } from "$lib/settings";

	const { children } = $props();
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
