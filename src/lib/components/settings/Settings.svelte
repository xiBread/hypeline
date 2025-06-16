<script lang="ts">
	import { invoke } from "@tauri-apps/api/core";
	import { Dialog, Separator, Tabs } from "bits-ui";
	import { tick } from "svelte";
	import { goto } from "$app/navigation";
	import { info, log } from "$lib/log";
	import { settings } from "$lib/settings";
	import { app } from "$lib/state.svelte";
	import TitleBar from "../TitleBar.svelte";
	import Appearance from "./appearance/Appearance.svelte";
	import Chat from "./chat/Chat.svelte";
	import Highlights from "./highlights/Highlights.svelte";

	let { open = $bindable(false), detached = false } = $props();

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
		{
			name: "Highlights",
			icon: "lucide--highlighter",
			component: Highlights,
		},
	];

	$effect(() => {
		if (!open) {
			settings.saveNow().then(() => {
				log.info("Settings saved");
			});
		}
	});

	async function popout() {
		open = false;
		await invoke("popout_settings");
	}

	async function logOut() {
		settings.state.user = null;
		settings.state.lastJoined = null;
		app.setJoined(null);

		await tick();
		await settings.saveNow();

		info("User logged out");
		await goto("/auth/login");
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Portal>
		<Dialog.Content
			class={[
				"bg-background absolute inset-0 h-screen w-screen",
				"data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
			]}
			escapeKeydownBehavior={detached ? "ignore" : "close"}
		>
			<TitleBar title="Settings">
				{#snippet icon()}
					<span class="lucide--settings iconify size-4" data-tauri-drag-region></span>
				{/snippet}
			</TitleBar>

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

					{#if !detached}
						<button
							class="hover:bg-muted hover:text-foreground text-muted-foreground flex w-full items-center gap-2 rounded-sm px-2.5 py-1.5 transition-colors duration-100"
							type="button"
							onclick={popout}
						>
							<span class="iconify lucide--external-link size-4"></span>
							<span class="text-sm">Popout settings</span>
						</button>
					{/if}

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
					{#if !detached}
						<Dialog.Close
							class="text-muted-foreground group hover:text-foreground absolute top-4 right-4 flex flex-col items-center"
							onclick={() => (open = false)}
						>
							<span class="iconify lucide--x size-6"></span>
						</Dialog.Close>
					{/if}

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
