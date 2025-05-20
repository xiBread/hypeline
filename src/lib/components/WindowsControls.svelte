<script lang="ts">
	import { window } from "@tauri-apps/api";
	import type { UnlistenFn } from "@tauri-apps/api/event";
	import { onDestroy, onMount } from "svelte";
	import type { HTMLButtonAttributes } from "svelte/elements";

	type ControlType = "minimize" | "maximize" | "close";

	const current = window.getCurrentWindow();

	let id: number | undefined;
	let unlisten: UnlistenFn | undefined;

	let maximized = $state(false);

	onMount(async () => {
		unlisten = await current.onResized(async () => {
			maximized = await current.isMaximized();
		});
	});

	onDestroy(() => unlisten?.());
</script>

{@render control("minimize", {
	onclick: () => current.minimize(),
})}

{@render control("maximize", {
	onclick: () => current.toggleMaximize(),
})}

{@render control("close", {
	onclick: () => {
		clearTimeout(id);
		current.close();
	},
})}

{#snippet control(type: ControlType, rest: HTMLButtonAttributes)}
	<button
		class="h-title-bar flex w-12 items-center justify-center bg-transparent text-[10px] font-light transition-colors hover:bg-white/10 hover:data-[control=close]:bg-[#ff0000]/70"
		data-control={type}
		{...rest}
	>
		{#if type === "minimize"}
			<!-- eslint-disable-next-line svelte/no-useless-mustaches -->
			{"\uE921"}
		{:else if type === "maximize"}
			{maximized ? "\uE923" : "\uE922"}
		{:else}
			<!-- eslint-disable-next-line svelte/no-useless-mustaches -->
			{"\uE8BB"}
		{/if}
	</button>
{/snippet}

<style>
	[data-control] {
		text-rendering: optimizeLegibility;
		font-family: "Segoe Fluent Icons", "Segoe MDL2 Assets";
	}
</style>
