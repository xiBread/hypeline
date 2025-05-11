<script lang="ts">
	import { Label, RadioGroup } from "bits-ui";
	import { settings } from "$lib/settings";
	import Input from "../../ui/Input.svelte";
	import Switch from "../../ui/Switch.svelte";

	const timeFormats = [
		{ name: "Auto", value: "auto" },
		{ name: "12-hour", value: "12" },
		{ name: "24-hour", value: "24" },
		{ name: "Custom", value: "custom" },
	];
</script>

<div class="space-y-6">
	<h2>Timestamps</h2>

	<Switch bind:checked={settings.state.timestamps.show}>
		<span class="font-medium">Show timestamps next to messages</span>
	</Switch>

	<div>
		<h3 class="mb-2">Format</h3>

		<RadioGroup.Root
			class="group space-y-1 data-disabled:cursor-not-allowed data-disabled:opacity-50"
			disabled={!settings.state.timestamps.show}
			bind:value={settings.state.timestamps.format}
		>
			{#each timeFormats as format (format.value)}
				<Label.Root
					class="hover:bg-muted has-data-[state=checked]:bg-muted flex items-center gap-3 rounded-sm px-3 py-2 transition-colors duration-100 hover:cursor-pointer aria-disabled:cursor-not-allowed"
					aria-disabled={!settings.state.timestamps.show}
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
		<h3 class="mb-2">Custom Format</h3>

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
			<a class="text-twitch-link" href="https://day.js.org/en">Day.js</a>; view the full list
			of tokens and their descriptions
			<a class="text-twitch-link" href="https://day.js.org/docs/en/display/format">here</a> (note
			that localized formats are not enabled).
		</p>
	</div>
</div>
