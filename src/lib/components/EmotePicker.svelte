<script lang="ts">
	import { Popover, Tabs } from "bits-ui";
	import { app } from "$lib/state.svelte";

	interface Props {
		open?: boolean;
		input?: HTMLInputElement;
		anchor?: HTMLElement;
	}

	let { open = $bindable(false), input, anchor }: Props = $props();

	function appendEmote(name: string) {
		if (!input) return;

		if (input.value.length > 0) {
			input.value += ` ${name}`;
		} else {
			input.value = name;
		}
	}
</script>

{#if app.user}
	{#await app.user.loadEmotes() then groups}
		<Popover.Root bind:open>
			<Popover.Portal>
				<Popover.Content
					class="bg-muted overflow-hidden rounded border"
					customAnchor={anchor}
					side="top"
					sideOffset={12}
					collisionPadding={8}
				>
					<Tabs.Root class="flex" orientation="vertical">
						<Tabs.List
							class="bg-sidebar flex max-h-96 flex-col gap-3 overflow-y-auto border-r p-2"
						>
							{#each groups as channel}
								<Tabs.Trigger value={channel.username}>
									<img
										class="size-8 rounded-full"
										src={channel.profile_picture_url}
										alt={channel.username}
									/>
								</Tabs.Trigger>
							{/each}
						</Tabs.List>

						{#each groups as channel}
							<Tabs.Content
								class="max-h-96 overflow-y-auto"
								value={channel.username}
							>
								<div class="bg-sidebar border-b p-2">
									{channel.username}'s emotes
								</div>

								<div
									class="grid grid-cols-7 content-start gap-2 p-2"
								>
									{#each channel.emotes as emote}
										<button
											title={emote.name}
											onclick={() =>
												appendEmote(emote.name)}
										>
											<img
												class="size-8"
												src="https://static-cdn.jtvnw.net/emoticons/v2/{emote.id}/{emote.format}/dark/3.0"
												alt={emote.name}
											/>
										</button>
									{/each}
								</div>
							</Tabs.Content>
						{/each}
					</Tabs.Root>
				</Popover.Content>
			</Popover.Portal>
		</Popover.Root>
	{/await}
{/if}
