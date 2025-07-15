<script lang="ts">
	import { Label, RadioGroup } from "bits-ui";
	import { settings } from "$lib/settings";
	import Switch from "../../ui/Switch.svelte";
	import Group from "../Group.svelte";
	import Messages from "./Messages.svelte";

	const mentionStyles = [
		{ name: "None", value: "none" },
		{ name: "Colored", value: "colored" },
		{ name: "Painted", value: "painted" },
	];
</script>

<div class="space-y-6">
	<h1>Chat</h1>

	<div class="divide-border divide-y *:py-6 *:first:pt-0 *:last:pb-0">
		<Group title="Usernames">
			<Switch bind:checked={settings.state.chat.localizedNames}>
				<span class="font-medium">Display localized names</span>

				{#snippet description()}
					Show the user's localized display name if they have their Twitch language set to
					Arabic, Chinese, Japanese, or Korean.
				{/snippet}
			</Switch>

			<Switch bind:checked={settings.state.chat.readableColors}>
				<span class="font-medium">Readable name colors</span>

				{#snippet description()}
					Lightens or darkens the color of usernames based on the current theme. This does
					not apply to 7TV paints.
				{/snippet}
			</Switch>

			<Group title="Mention style" nested>
				{#snippet description()}
					Choose how mentions in messages are displayed. Painted mentions will fallback to
					the user's color if they have no 7TV paint.
				{/snippet}

				<RadioGroup.Root
					class="group space-y-1 data-disabled:cursor-not-allowed data-disabled:opacity-50"
					bind:value={settings.state.chat.mentionStyle}
				>
					{#each mentionStyles as style (style.value)}
						<Label.Root
							class="hover:bg-muted has-data-[state=checked]:bg-muted flex items-center gap-3 rounded-md px-3 py-2 transition-colors duration-100 hover:cursor-pointer aria-disabled:cursor-not-allowed"
							aria-disabled={!settings.state.chat.mentionStyle}
						>
							<RadioGroup.Item
								class="data-[state=checked]:border-twitch data-[state=checked]:bg-foreground size-4 rounded-full border data-[state=checked]:border-5"
								value={style.value}
							/>

							{style.name}
						</Label.Root>
					{/each}
				</RadioGroup.Root>
			</Group>
		</Group>

		<Messages />
	</div>
</div>
