<script lang="ts">
	import { settings } from "$lib/state.svelte";
	import RefreshCw from "@lucide/svelte/icons/refresh-cw";
	import { Label, RadioGroup } from "bits-ui";
	import { setMode, userPrefersMode } from "mode-watcher";

	const themes = [
		{ value: "light", class: "bg-white" },
		{ value: "dark", class: "bg-neutral-950" },
		{ value: "system", class: "" },
	];

	const timeFormats = [
		{ name: "Auto", value: "auto" },
		{ name: "12-hour", value: "12" },
		{ name: "24-hour", value: "24" },
	];
</script>

<div class="space-y-6">
	<h1 class="text-2xl font-semibold">General</h1>

	<h2 class="text-xl font-medium">Appearance</h2>

	<div>
		<h3 class="mb-2 text-lg font-medium">Theme</h3>

		<RadioGroup.Root
			class="flex items-center gap-6"
			bind:value={
				() => $userPrefersMode, (value) => setMode(value as never)
			}
		>
			{#each themes as theme (theme.value)}
				<Label.Root class="flex flex-col items-center gap-2">
					<RadioGroup.Item
						class={[
							"flex size-16 items-center justify-center rounded-full border border-neutral-500",
							theme.class,
							$userPrefersMode === theme.value &&
								"border-twitch border-2",
						]}
						value={theme.value}
					>
						{#if theme.value === "system"}
							<RefreshCw class="text-muted-foreground size-6" />
						{/if}
					</RadioGroup.Item>

					<span class="text-sm font-medium capitalize">
						{theme.value}
					</span>
				</Label.Root>
			{/each}
		</RadioGroup.Root>
	</div>

	<div>
		<h3 class="mb-2 text-lg font-medium">Time Format</h3>

		<RadioGroup.Root
			class="space-y-1"
			bind:value={settings.state.timeFormat}
		>
			{#each timeFormats as format (format.value)}
				<Label.Root
					class="hover:bg-muted has-data-[state=checked]:bg-muted flex items-center gap-3 rounded-md p-3 transition-colors duration-100"
				>
					<RadioGroup.Item
						class="data-[state=checked]:border-twitch data-[state=checked]:bg-foreground size-5 rounded-full border data-[state=checked]:border-6"
						value={format.value}
					/>

					{format.name}
				</Label.Root>
			{/each}
		</RadioGroup.Root>
	</div>
</div>
