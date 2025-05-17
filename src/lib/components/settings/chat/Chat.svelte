<script lang="ts">
	import { settings } from "$lib/settings";
	import Switch from "../../ui/Switch.svelte";
	import Messages from "./Messages.svelte";
</script>

<div class="space-y-6">
	<h1>Chat</h1>

	<div class="divide-border divide-y *:py-6 *:first:pt-0 *:last:pb-0">
		<div class="space-y-6">
			<h2>Usernames</h2>

			<Switch bind:checked={settings.state.localizedNames}>
				<span class="font-medium">Display localized names</span>

				{#snippet description()}
					Show the user's localized display name if they have their Twitch language set to
					Chinese, Japanese, or Korean.
				{/snippet}
			</Switch>

			<Switch bind:checked={settings.state.coloredMentions}>
				<span class="font-medium">Colored mentions</span>

				{#snippet description()}
					Whether to color usernames when mentioned in chat. This also applies to replies.
				{/snippet}
			</Switch>

			<Switch bind:checked={settings.state.readableColors}>
				<span class="font-medium">Readable name colors</span>

				<!-- todo: mention not applied to 7tv paints when added -->
				{#snippet description()}
					Lightens or darkens the color of usernames based on the current theme.
				{/snippet}
			</Switch>
		</div>

		<Messages />
	</div>
</div>
