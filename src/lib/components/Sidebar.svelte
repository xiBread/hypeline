<script lang="ts">
	import { ScrollArea } from "bits-ui";
	import ChannelList from "./ChannelList.svelte";
	import JoinDialog from "./JoinDialog.svelte";
	import Settings from "./settings/Settings.svelte";

	let settingsOpen = $state(false);
	let joinOpen = $state(false);
</script>

<Settings bind:open={settingsOpen} />
<JoinDialog bind:open={joinOpen} />

<ScrollArea.Root>
	<ScrollArea.Viewport class="h-full">
		<nav class="h-full space-y-4 p-3 pt-0">
			<div class="space-y-2">
				<button
					class="bg-twitch flex size-10 items-center justify-center rounded-md"
					title="Settings"
					type="button"
					onclick={() => (settingsOpen = true)}
					aria-label="Open settings"
				>
					<span class="lucide--settings iconify size-5 text-white"></span>
				</button>

				<button
					class="bg-twitch flex size-10 items-center justify-center rounded-md"
					title="Join a channel"
					type="button"
					onclick={() => (joinOpen = true)}
					aria-label="Join a channel"
				>
					<span class="lucide--plus iconify size-5 text-white"></span>
				</button>
			</div>

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
