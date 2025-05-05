<script lang="ts">
	import RefreshCw from "@lucide/svelte/icons/refresh-cw";
	import { Label, RadioGroup } from "bits-ui";
	import { setMode, userPrefersMode } from "mode-watcher";
	import { settings } from "$lib/settings";
	import Input from "../ui/Input.svelte";
	import Switch from "../ui/Switch.svelte";

	const themes = [
		{ value: "light", class: "bg-white" },
		{ value: "dark", class: "bg-neutral-950" },
		{ value: "system", class: "" },
	];

	const timeFormats = [
		{ name: "Auto", value: "auto" },
		{ name: "12-hour", value: "12" },
		{ name: "24-hour", value: "24" },
		{ name: "Custom", value: "custom" },
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
				() => userPrefersMode.current, (value) => setMode(value)
			}
		>
			{#each themes as theme (theme.value)}
				<Label.Root class="flex flex-col items-center gap-2">
					<RadioGroup.Item
						class={[
							"flex size-16 items-center justify-center rounded-full border border-neutral-500",
							theme.class,
							userPrefersMode.current === theme.value &&
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

	<div class="space-y-6">
		<div>
			<h3 class="mb-2 text-lg font-medium">Timestamps</h3>

			<Switch bind:checked={settings.state.timestamps.enabled}>
				Show timestamps next to messages
			</Switch>
		</div>

		<div>
			<h4 class="mb-2">Format</h4>

			<RadioGroup.Root
				class="group space-y-1 data-disabled:cursor-not-allowed data-disabled:opacity-50"
				disabled={!settings.state.timestamps.enabled}
				bind:value={settings.state.timestamps.format}
			>
				{#each timeFormats as format (format.value)}
					<Label.Root
						class="hover:bg-muted has-data-[state=checked]:bg-muted flex items-center gap-3 rounded-sm px-3 py-2 transition-colors duration-100 hover:cursor-pointer aria-disabled:cursor-not-allowed"
						aria-disabled={!settings.state.timestamps.enabled}
					>
						<RadioGroup.Item
							class="data-[state=checked]:border-twitch data-[state=checked]:bg-foreground size-4 rounded-full border data-[state=checked]:border-5"
							value={format.value}
						/>

						{format.name}
					</Label.Root>
				{/each}
			</RadioGroup.Root>
		</div>

		<div>
			<h4 class="mb-2">Custom format</h4>

			<Input
				class="max-w-1/2"
				type="text"
				autocapitalize="off"
				autocomplete="off"
				disabled={settings.state.timestamps.format !== "custom"}
				bind:value={settings.state.timestamps.customFormat}
			/>

			<p class="text-muted-foreground mt-2 text-sm">
				Formats use the format tokens used by
				<a class="text-twitch-link" href="https://day.js.org/en"
					>Day.js</a
				>; view the full list of tokens and their descriptions
				<a
					class="text-twitch-link"
					href="https://day.js.org/docs/en/display/format">here</a
				> (note that localized formats are not enabled).
			</p>
		</div>
	</div>
</div>
