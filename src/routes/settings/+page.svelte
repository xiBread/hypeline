<script lang="ts">
	import MonitorCog from "@lucide/svelte/icons/monitor-cog";
	import { Tabs } from "bits-ui";
	import General from "./General.svelte";

	const categories = [
		{ key: "general", icon: MonitorCog, component: General },
	];
</script>

<Tabs.Root class="flex" orientation="vertical" value="general">
	<nav class="bg-sidebar h-full min-h-screen border-r px-2 py-3.5">
		<Tabs.List>
			{#each categories as category (category.key)}
				<Tabs.Trigger
					class={[
						"flex size-10 items-center justify-center rounded-md",
						"hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
						"data-[state=active]:bg-sidebar-accent data-[state=active]:text-sidebar-accent-foreground",
					]}
					value={category.key}
				>
					<category.icon class="size-5" />
				</Tabs.Trigger>
			{/each}
		</Tabs.List>
	</nav>

	<div class="grow p-4">
		{#each categories as category (category.key)}
			<Tabs.Content value={category.key}>
				<category.component />
			</Tabs.Content>
		{/each}
	</div>
</Tabs.Root>
