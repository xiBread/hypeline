<script lang="ts">
	import { platform } from "@tauri-apps/plugin-os";
	import { Dialog, Separator, Tabs } from "bits-ui";
	import { tick } from "svelte";
	import { goto } from "$app/navigation";
	import { settings } from "$lib/settings";
	import WindowsControls from "../WindowsControls.svelte";
	import Appearance from "./appearance/Appearance.svelte";
	import Chat from "./chat/Chat.svelte";

	let { open = $bindable(false) } = $props();

	const platformName = platform();

	const categories = [
		{
			name: "Appearance",
			icon: "lucide--monitor-cog",
			component: Appearance,
		},
		{
			name: "Chat",
			icon: "lucide--message-square",
			component: Chat,
		},
	];

	$effect(() => {
		void open;

		settings.saveNow();
	});

	async function logOut() {
		settings.state.user = null;

		await tick();
		await settings.saveNow();

		await goto("/auth/login");
	}
</script>

<svelte:document
	onkeydown={(event) => {
		if (event.key === "Escape") open = false;
	}}
/>

<Dialog.Root bind:open>
	<Dialog.Portal>
		<Dialog.Content
			class={[
				"bg-background absolute inset-0 h-screen w-screen",
				"data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
			]}
		>
			<div
				class="min-h-title-bar relative flex items-center justify-center bg-transparent"
				data-tauri-drag-region
			>
				<Dialog.Title class="pointer-events-none text-sm font-medium">
					Settings
				</Dialog.Title>

				{#if platformName === "windows"}
					<div class="absolute top-0 right-0 flex">
						<WindowsControls />
					</div>
				{/if}
			</div>

			<Tabs.Root class="relative flex h-full" orientation="vertical" value="Appearance">
				<nav class="h-full min-w-44 p-2 pt-0">
					<Tabs.List class="space-y-1">
						{#each categories as category (category.name)}
							<Tabs.Trigger
								class={[
									"text-muted-foreground flex w-full items-center gap-2 rounded-sm px-2.5 py-1.5 transition-colors duration-100",
									"hover:bg-muted hover:text-foreground",
									"data-[state=active]:bg-muted data-[state=active]:text-foreground",
								]}
								value={category.name}
							>
								<span class="iconify size-4 {category.icon}"></span>
								<span class="text-sm">{category.name}</span>
							</Tabs.Trigger>
						{/each}
					</Tabs.List>

					<Separator.Root class="bg-border my-1 h-px w-full" />

					<button
						class="text-destructive hover:bg-muted flex w-full items-center gap-2 rounded-sm px-2.5 py-1.5 transition-colors duration-100"
						type="button"
						onclick={logOut}
					>
						<span class="iconify lucide--log-out size-4"></span>
						<span class="text-sm">Log out</span>
					</button>
				</nav>

				<div
					class="relative grow overflow-y-auto rounded-tl-lg border-t border-l p-4 pb-16"
				>
					<Dialog.Close
						class="text-muted-foreground group hover:text-foreground absolute top-4 right-4 flex flex-col items-center"
						onclick={() => (open = false)}
					>
						<div
							class="group-hover:border-foreground border-muted-foreground flex size-8 items-center justify-center rounded-full border-2 transition-colors duration-100"
						>
							<span class="iconify lucide--x size-4"></span>
						</div>

						<span class="mt-1 text-xs transition-colors duration-100">ESC</span>
					</Dialog.Close>

					{#each categories as category (category.name)}
						<Tabs.Content value={category.name}>
							<category.component />
						</Tabs.Content>
					{/each}
				</div>
			</Tabs.Root>
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>
