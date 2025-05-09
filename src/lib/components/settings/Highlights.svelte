<script lang="ts">
	import { defaultHighlightTypes, settings } from "$lib/settings";
	import Input from "../ui/Input.svelte";
	import * as Select from "../ui/select";

	type HlKey = Exclude<keyof typeof settings.state.highlights, "enabled">;

	const highlights = [
		{ label: "Mentions", value: "mention" },
		{ label: "First Time Chats", value: "new" },
		{ label: "Returning Chatters", value: "returning" },
		{ label: "Suspicious Users", value: "suspicious" },
		{ label: "Moderators", value: "moderator" },
		{ label: "Subscribers", value: "subscriber" },
		{ label: "VIPs", value: "vip" },
	];

	const styles = [
		{ label: "Default", value: "default" },
		{ label: "Compact", value: "compact" },
		{ label: "Background", value: "background" },
		{ label: "Disabled", value: "disabled" },
	];

	function reset(key: HlKey) {
		settings.state.highlights[key] = defaultHighlightTypes[key];
	}
</script>

<div class="space-y-6">
	<h2 class="text-xl font-medium">Highlights</h2>

	<div class="grid grid-cols-[repeat(4,auto)] items-center gap-x-3 gap-y-4">
		<span class="col-start-2 text-sm font-medium">Color</span>
		<span class="text-sm font-medium">Style</span>

		{#each highlights as highlight}
			{@const hlType =
				settings.state.highlights[highlight.value as HlKey]}

			<span class="col-start-1 text-sm font-medium"
				>{highlight.label}</span
			>

			<div class="flex items-center gap-x-1.5">
				<div
					class="border-input size-9 shrink-0 rounded-md border"
					style:background-color={hlType.color}
				></div>

				<Input
					class="min-w-24"
					type="text"
					pattern="#[\da-fA-F]{'{6}'}"
					bind:value={hlType.color}
				/>
			</div>

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
				<Select.Trigger class="w-full">
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
				onclick={() => reset(highlight.value as HlKey)}
			>
				<span class="iconify lucide--rotate-cw"></span>
			</button>
		{/each}
	</div>
</div>
