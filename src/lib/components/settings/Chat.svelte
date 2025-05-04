<script lang="ts">
	import { Label, Slider, Switch } from "bits-ui";
	import { settings } from "$lib/settings";
</script>

<div class="space-y-6">
	<h1 class="text-2xl font-semibold">Chat</h1>

	<h2 class="text-xl font-medium">Messages</h2>

	<div>
		<h3 class="mb-2 text-lg font-medium">Message History Limit</h3>

		<p class="text-muted-foreground mb-4 text-sm">
			This feature uses a
			<a
				class="text-twitch-link"
				href="https://recent-messages.robotty.de/">third-party API</a
			> that temporarily stores the messages sent in joined channels. To opt-out,
			disable this setting.
		</p>

		<Label.Root
			class="mb-6 flex max-w-min items-center hover:cursor-pointer"
		>
			<Switch.Root
				class="data-[state=checked]:bg-twitch data-[state=unchecked]:bg-input h-6 w-11 items-center rounded-full border-2 border-transparent transition-colors"
				bind:checked={settings.state.historyEnabled}
			>
				<Switch.Thumb
					class="pointer-events-none block size-4.5 rounded-full bg-white shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0.5"
				/>
			</Switch.Root>

			<span class="ml-2 text-sm font-medium">Enable</span>
		</Label.Root>

		<p
			class={[
				"text-muted-foreground mb-6 text-sm",
				!settings.state.historyEnabled && "opacity-50",
			]}
		>
			Change how many previous messages to load when joining a channel.
		</p>

		<Slider.Root
			class="relative flex items-center data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
			type="single"
			min={0}
			max={800}
			step={50}
			disabled={!settings.state.historyEnabled}
			bind:value={settings.state.historyLimit}
		>
			<div
				class="bg-input relative h-2 w-full rounded-full hover:cursor-pointer"
			>
				<Slider.Range class="bg-twitch absolute h-full rounded-full" />
			</div>

			<Slider.Thumb
				class="flex size-5 justify-center rounded-full bg-white hover:cursor-grab active:scale-110 active:cursor-grabbing"
				index={0}
			>
				<div class="mt-7 text-center text-xs font-medium">
					{settings.state.historyLimit}
				</div>
			</Slider.Thumb>
		</Slider.Root>
	</div>
</div>
