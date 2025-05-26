<script lang="ts">
	import { Popover } from "bits-ui";
	import ColorPicker from "$lib/components/ui/ColorPicker.svelte";
	import { defaultHighlightTypes, settings } from "$lib/settings";
	import type { HighlightType } from "$lib/settings";
	import * as Select from "../../ui/select";
	import Group from "../Group.svelte";
	import { styles } from ".";

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

	function reset(key: HighlightType) {
		settings.state.highlights[key] = defaultHighlightTypes[key];
	}
</script>

<Group title="Viewers">
	<div class="overflow-x-auto">
		<div class="grid min-w-max grid-cols-[repeat(4,auto)] items-center gap-x-3 gap-y-4">
			{#each highlights as highlight}
				{@const hlType = settings.state.highlights[highlight.value]}

				<span class="col-start-1 text-sm font-medium">
					{highlight.label}
				</span>

				<Popover.Root>
					<Popover.Trigger
						class="border-input size-9 shrink-0 justify-self-center rounded-md border bg-(--highlight)"
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
							<Select.Item class="hover:cursor-pointer" value={style.value}>
								{style.label}
							</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>

				<button
					class="dark:hover:bg-input/50 dark:bg-input/30 border-input flex size-9 items-center justify-center rounded-md border bg-transparent"
					title="Reset to default"
					type="button"
					aria-label="Reset to default"
					onclick={() => reset(highlight.value)}
				>
					<span class="iconify lucide--rotate-cw"></span>
				</button>
			{/each}
		</div>
	</div>
</Group>
