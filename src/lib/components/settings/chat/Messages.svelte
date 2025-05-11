<script lang="ts">
	import { Slider } from "bits-ui";
	import { settings } from "$lib/settings";
	import Switch from "../../ui/Switch.svelte";
</script>

<div class="space-y-6">
	<h2>Messages</h2>

	<div>
		<h3 class="mb-2">Message History</h3>

		<p class="text-muted-foreground mb-4 text-sm">
			This feature uses a
			<a class="text-twitch-link" href="https://recent-messages.robotty.de/"
				>third-party API</a
			> that temporarily stores the messages sent in joined channels. To opt-out, disable this
			setting.
		</p>

		<Switch class="mb-6" bind:checked={settings.state.history.enabled}>
			<span class="text-sm font-medium">Fetch recent messages upon joining a channel</span>
		</Switch>

		<p
			class={[
				"text-muted-foreground mb-6 text-sm",
				!settings.state.history.enabled && "opacity-50",
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
			disabled={!settings.state.history.enabled}
			bind:value={settings.state.history.limit}
		>
			<div class="bg-input relative h-2 w-full rounded-full hover:cursor-pointer">
				<Slider.Range class="bg-twitch absolute h-full rounded-full" />
			</div>

			<Slider.Thumb
				class="flex size-5 justify-center rounded-full bg-white hover:cursor-grab active:scale-110 active:cursor-grabbing"
				index={0}
			>
				<div class="mt-7 text-center text-xs font-medium">
					{settings.state.history.limit}
				</div>
			</Slider.Thumb>
		</Slider.Root>
	</div>
</div>
