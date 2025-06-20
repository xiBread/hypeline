<script lang="ts">
	import { getVersion } from "@tauri-apps/api/app";
	import { invoke } from "@tauri-apps/api/core";
	import { appLogDir } from "@tauri-apps/api/path";
	import { writeText } from "@tauri-apps/plugin-clipboard-manager";
	import { openPath } from "@tauri-apps/plugin-opener";
	import * as os from "@tauri-apps/plugin-os";
	import { Dialog, Separator, Tabs } from "bits-ui";
	import { tick } from "svelte";
	import { goto } from "$app/navigation";
	import { log } from "$lib/log";
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

	async function detach() {
		open = false;
		await invoke("detach_settings");

		log.info("Settings detached");
	}

	async function openLogDir() {
		await openPath(await appLogDir());
	}

	async function copyDebugInfo() {
		const appVersion = await getVersion();

		// TODO: add commit hash
		const appInfo = `Hypeline v${appVersion}`;
		const osInfo = `${os.platform()} ${os.arch()} (${os.version()})`;

		await writeText(`${appInfo}\n${osInfo}`);
	}

	async function logOut() {
		settings.state.user = null;
		settings.state.lastJoined = null;
		app.setJoined(null);

		await tick();
		await settings.saveNow();

		log.info("User logged out");
		await goto("/auth/login");
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Portal>
		<Dialog.Content
			class={[
				"bg-background absolute inset-0 h-screen w-screen",
				!detached &&
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
								class="settings-btn data-[state=active]:bg-muted data-[state=active]:text-foreground"
								value={category.name}
							>
								<span class="iconify size-4 {category.icon}"></span>
								<span class="text-sm">{category.name}</span>
							</Tabs.Trigger>
						{/each}
					</Tabs.List>

					<Separator.Root class="bg-border my-1 h-px w-full" />

					<div class="space-y-1">
						{#if !detached}
							<button class="settings-btn" type="button" onclick={detach}>
								<span class="iconify lucide--external-link size-4"></span>
								<span class="text-sm">Popout settings</span>
							</button>
						{/if}

						<button class="settings-btn" type="button" onclick={openLogDir}>
							<span class="iconify lucide--folder-open size-4"></span>
							<span class="text-sm">Open logs</span>
						</button>

						<button class="settings-btn" type="button" onclick={copyDebugInfo}>
							<span class="iconify lucide--clipboard size-4"></span>
							<span class="text-sm">Copy debug info</span>
						</button>
					</div>

					<Separator.Root class="bg-border my-1 h-px w-full" />

					<button
						class="settings-btn text-destructive! hover:text-destructive hover:bg-destructive/10!"
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

<style>
	@reference "../../../app.css";

	:global(.settings-btn) {
		color: var(--color-muted-foreground);
		width: 100%;
		display: flex;
		align-items: center;
		column-gap: --spacing(2);
		border-radius: var(--radius-sm);
		padding: --spacing(1.5) --spacing(2.5);
		transition-property: color, background-color;
		transition-duration: 100ms;
		transition-timing-function: var(--default-transition-timing-function);

		&:hover {
			color: var(--color-foreground);
			background-color: var(--color-muted);
		}
	}
</style>
