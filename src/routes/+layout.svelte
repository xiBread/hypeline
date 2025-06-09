<script lang="ts">
	import "../app.css";
	import { Tooltip } from "bits-ui";
	import { ModeWatcher } from "mode-watcher";
	import { page } from "$app/state";
	import Sidebar from "$lib/components/Sidebar.svelte";
	import TitleBar from "$lib/components/TitleBar.svelte";
	import { settings } from "$lib/settings";
	import { app } from "$lib/state.svelte";

	const { children } = $props();

	const titleBar = $derived({
		icon: app.joined?.user.avatarUrl ?? "/favicon.png",
		title: app.joined?.user.displayName ?? "Hypeline",
	});
</script>

<ModeWatcher />

<div class="flex max-h-screen flex-col">
	<TitleBar title={titleBar.title}>
		{#snippet icon()}
			<img
				class="size-5 rounded-full"
				src={titleBar.icon}
				alt={titleBar.title}
				data-tauri-drag-region
			/>
		{/snippet}
	</TitleBar>

	<Tooltip.Provider delayDuration={100}>
		<div class="flex grow overflow-hidden">
			{#if settings.state.user && !page.data.detached}
				<Sidebar />
			{/if}

			<main class={["grow", settings.state.user && "rounded-tl-lg border-t border-l"]}>
				{@render children()}
			</main>
		</div>
	</Tooltip.Provider>
</div>
