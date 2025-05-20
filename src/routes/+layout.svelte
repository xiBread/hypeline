<script lang="ts">
	import "../app.css";
	import { platform } from "@tauri-apps/plugin-os";
	import { Tooltip } from "bits-ui";
	import { ModeWatcher } from "mode-watcher";
	import Sidebar from "$lib/components/Sidebar.svelte";
	import WindowsControls from "$lib/components/WindowsControls.svelte";
	import { settings } from "$lib/settings";
	import { app } from "$lib/state.svelte";

	const { children } = $props();

	const platformName = platform();

	const titleBar = $derived({
		icon: app.active?.user.profilePictureUrl ?? "/favicon.png",
		title: app.active?.user.displayName ?? "Hypeline",
	});
</script>

<ModeWatcher />

<div class="flex max-h-screen flex-col">
	<div
		class="min-h-title-bar relative flex w-full shrink-0 items-center justify-center gap-1.5"
		data-tauri-drag-region
	>
		<img
			class="size-5 rounded-full"
			src={titleBar.icon}
			alt={titleBar.title}
			data-tauri-drag-region
		/>

		<span class="pointer-events-none text-sm font-medium" data-tauri-drag-region>
			{titleBar.title}
		</span>

		{#if platformName === "windows"}
			<div class="absolute top-0 right-0 flex">
				<WindowsControls />
			</div>
		{/if}
	</div>

	<Tooltip.Provider delayDuration={100}>
		<div class="flex grow overflow-hidden">
			{#if settings.state.user}
				<Sidebar />
			{/if}

			<main class="grow rounded-tl-lg border-t border-l">
				{@render children()}
			</main>
		</div>
	</Tooltip.Provider>
</div>
