<script lang="ts">
	import { ScrollArea } from "bits-ui";
	import ChannelList from "./ChannelList.svelte";
	import Settings from "./settings/Settings.svelte";

	let settingsOpen = $state(false);
</script>

<Settings bind:open={settingsOpen} />

<ScrollArea.Root>
	<ScrollArea.Viewport class="h-full">
		<nav class="flex h-full flex-col gap-4 p-3 pt-0">
			<button
				class="bg-twitch flex size-10 items-center justify-center rounded-md"
				title="Settings"
				type="button"
				onclick={() => (settingsOpen = true)}
				aria-label="Open settings"
			>
				<span class="lucide--settings iconify size-5 text-white"></span>
			</button>

			<ChannelList />
		</nav>
	</ScrollArea.Viewport>

	<ScrollArea.Scrollbar
		class={[
			"w-2 p-0.5",
			"data-[state=hidden]:fade-out-0 data-[state=visible]:fade-in-0 data-[state=visible]:animate-in data-[state=hidden]:animate-out",
		]}
		orientation="vertical"
	>
		<ScrollArea.Thumb class="bg-muted-foreground/80 rounded-full" />
	</ScrollArea.Scrollbar>
</ScrollArea.Root>
