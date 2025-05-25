<script lang="ts">
	import { Label, Slider } from "bits-ui";
	import { settings } from "$lib/settings";
	import Switch from "../../ui/Switch.svelte";
	import Group from "../Group.svelte";
</script>

<Group title="Messages">
	<Group title="Message History" nested>
		<Switch bind:checked={settings.state.history.enabled}>
			<span class="text-sm font-medium">Fetch recent messages upon joining a channel</span>

			{#snippet description()}
				This feature uses a
				<a class="text-twitch-link" href="https://recent-messages.robotty.de/"
					>third-party API</a
				> that temporarily stores the messages sent in joined channels. To opt-out, disable this
				setting.
			{/snippet}
		</Switch>

		<div>
			<div class="mb-4">
				<Label.Root class="text-sm font-medium" for="history-limit">Limit</Label.Root>

				<p class="text-muted-foreground mt-2 text-sm">
					Change how many previous messages to load when joining a channel.
				</p>
			</div>

			<Slider.Root
				id="history-limit"
				class="relative flex items-center"
				type="single"
				min={0}
				max={800}
				step={50}
				disabled={!settings.state.history.enabled}
				bind:value={settings.state.history.limit}
			>
				<div class="bg-input relative h-1.5 w-full rounded-full hover:cursor-pointer">
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
	</Group>
</Group>
