<script lang="ts">
	import MonitorCog from "@lucide/svelte/icons/monitor-cog";
	import X from "@lucide/svelte/icons/x";
	import { Dialog, Tabs } from "bits-ui";
	import General from "./General.svelte";

	let { open = $bindable(false) } = $props();

	const categories = [
		{ name: "General", icon: MonitorCog, component: General },
	];
</script>

<svelte:document
	onkeydown={(event) => {
		if (event.key === "Escape") open = false;
	}}
/>

<Dialog.Root bind:open>
	<Dialog.Portal>
		<Dialog.Content
			class="bg-background absolute inset-0 h-screen w-screen"
		>
			<Tabs.Root
				class="flex h-full"
				orientation="vertical"
				value="General"
			>
				<nav class="bg-sidebar h-full w-48 border-r p-2">
					<Dialog.Title
						class="text-muted-foreground mb-2 text-xs font-semibold uppercase"
					>
						Settings
					</Dialog.Title>

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
								<category.icon class="size-4" />
								<span class="text-sm">{category.name}</span>
							</Tabs.Trigger>
						{/each}
					</Tabs.List>
				</nav>

				<div class="relative grow p-4">
					<Dialog.Close
						class="text-muted-foreground group hover:text-foreground absolute top-4 right-4 flex flex-col items-center"
						onclick={() => (open = false)}
					>
						<div
							class="group-hover:border-foreground border-muted-foreground flex size-8 items-center justify-center rounded-full border-2 transition-colors duration-100"
						>
							<X class="size-4" />
						</div>

						<span
							class="mt-1 text-xs transition-colors duration-100"
						>
							ESC
						</span>
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
