<script lang="ts">
	import { Popover } from "bits-ui";
	import { defaultHighlightTypes, settings } from "$lib/settings";
	import type { HighlightType } from "$lib/settings";
	import ColorPicker from "../../ui/ColorPicker.svelte";
	import * as Select from "../../ui/select";

	const highlights = [
		{ label: "Mentions", value: "mention" },
		{ label: "First Time Chats", value: "new" },
		{ label: "Returning Chatters", value: "returning" },
		{ label: "Suspicious Users", value: "suspicious" },
		{ label: "Broadcasters", value: "broadcaster" },
		{ label: "Moderators", value: "moderator" },
		{ label: "Subscribers", value: "subscriber" },
		{ label: "VIPs", value: "vip" },
	] as const;

	const styles = [
		{ label: "Default", value: "default" },
		{ label: "Compact", value: "compact" },
		{ label: "Background", value: "background" },
		{ label: "Disabled", value: "disabled" },
	];

	function reset(key: HighlightType) {
		settings.state.highlights[key] = defaultHighlightTypes[key];
	}
</script>

<div class="space-y-6">
	<hgroup>
		<h2 class="mb-2">Highlights</h2>

		<p class="text-muted-foreground text-sm">
			Message highlights allow you to easily identify different types of
			viewers.
		</p>
	</hgroup>

	<div class="grid grid-cols-[repeat(4,auto)] items-center gap-x-3 gap-y-4">
		<span class="col-start-2 text-sm font-medium">Color</span>
		<span class="text-sm font-medium">Style</span>

		{#each highlights as highlight}
			{@const hlType = settings.state.highlights[highlight.value]}

			<span class="col-start-1 text-sm font-medium">
				{highlight.label}
			</span>

			<Popover.Root>
				<Popover.Trigger
					class="border-input size-9 shrink-0 rounded-md border bg-(--highlight)"
					--highlight={hlType.color}
				/>

				<Popover.Content class="w-60" sideOffset={10}>
					<ColorPicker
						class="bg-background rounded-md border p-3"
						bind:value={hlType.color}
					/>
				</Popover.Content>
			</Popover.Root>

			<Select.Root
				type="single"
				bind:value={
					() => (hlType.enabled ? hlType.style : "disabled"),
					(value) => {
						if (value === "disabled") {
							hlType.enabled = false;
						} else {
							hlType.enabled = true;
							hlType.style = value;
						}
					}
				}
			>
				<Select.Trigger class="w-full min-w-36">
					{hlType.enabled
						? styles.find((h) => h.value === hlType.style)!.label
						: "Disabled"}
				</Select.Trigger>

				<Select.Content>
					{#each styles as style}
						<Select.Item
							class="hover:cursor-pointer"
							value={style.value}
						>
							{style.label}
						</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>

			<button
				class="dark:hover:bg-input/50 dark:bg-input/30 border-input flex size-9 items-center justify-center rounded-md border bg-transparent"
				type="button"
				aria-label="Reset to default"
				onclick={() => reset(highlight.value)}
			>
				<span class="iconify lucide--rotate-cw"></span>
			</button>
		{/each}
	</div>
</div>
