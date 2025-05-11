<script lang="ts">
	import { invoke } from "@tauri-apps/api/core";
	import { Popover, Tabs } from "bits-ui";
	import { onMount } from "svelte";
	import type { UserEmote } from "$lib/tauri";

	interface Props {
		open?: boolean;
		input?: HTMLInputElement | null;
		anchor?: HTMLElement;
	}

	interface EmoteGroup {
		displayName: string;
		profilePictureUrl: string;
		emotes: Omit<UserEmote, "owner" | "owner_profile_picture_url">[];
	}

	let { open = $bindable(false), input, anchor }: Props = $props();

	let channels = $state<EmoteGroup[]>([]);

	onMount(async () => {
		channels = await fetchEmotes();
	});

	function appendEmote(name: string) {
		if (!input) return;

		if (input.value.length > 0) {
			input.value += ` ${name}`;
		} else {
			input.value = name;
		}
	}

	async function fetchEmotes() {
		const grouped: Record<string, EmoteGroup> = {};

		const emotes = await invoke<UserEmote[]>("get_user_emotes");
		emotes.sort((a, b) => a.owner.localeCompare(b.owner));

		for (const { owner, owner_profile_picture_url, ...emote } of emotes) {
			if (!grouped[owner]) {
				grouped[owner] = {
					displayName: owner,
					profilePictureUrl: owner_profile_picture_url,
					emotes: [],
				};
			}

			grouped[owner].emotes.push(emote);
		}

		return Object.values(grouped);
	}
</script>

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
					{#each channels as channel}
						<Tabs.Trigger value={channel.displayName}>
							<img
								class="size-8 rounded-full"
								src={channel.profilePictureUrl}
								alt={channel.displayName}
							/>
						</Tabs.Trigger>
					{/each}
				</Tabs.List>

				{#each channels as channel}
					<Tabs.Content class="max-h-96 overflow-y-auto" value={channel.displayName}>
						<div class="bg-sidebar border-b p-2">
							{channel.displayName}'s emotes
						</div>

						<div class="grid grid-cols-7 content-start gap-2 p-2">
							{#each channel.emotes as emote}
								<button title={emote.name} onclick={() => appendEmote(emote.name)}>
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
