<script lang="ts">
	import { settings } from "$lib/settings";
	import Switch from "../../ui/Switch.svelte";
	import Group from "../Group.svelte";
	import Messages from "./Messages.svelte";
</script>

<div class="space-y-6">
	<h1>Chat</h1>

	<div class="divide-border divide-y *:py-6 *:first:pt-0 *:last:pb-0">
		<Group title="Usernames">
			<Switch bind:checked={settings.state.chat.localizedNames}>
				<span class="font-medium">Display localized names</span>

				{#snippet description()}
					Show the user's localized display name if they have their Twitch language set to
					Chinese, Japanese, or Korean.
				{/snippet}
			</Switch>

			<Switch bind:checked={settings.state.chat.coloredMentions}>
				<span class="font-medium">Colored mentions</span>

				{#snippet description()}
					Whether to color usernames when mentioned in chat. This also applies to replies.
				{/snippet}
			</Switch>

			<Switch bind:checked={settings.state.chat.readableColors}>
				<span class="font-medium">Readable name colors</span>

				{#snippet description()}
					Lightens or darkens the color of usernames based on the current theme. This does
					not apply to 7TV paints.
				{/snippet}
			</Switch>
		</Group>

		<Messages />
	</div>
</div>
