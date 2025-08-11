<script lang="ts">
	import { Combobox, Dialog } from "bits-ui";
	import { settings } from "$lib/settings";
	import { app } from "$lib/state.svelte";
	import { debounce } from "$lib/util";
	import Input from "./ui/Input.svelte";

	interface Suggestion {
		id: string;
		displayName: string;
		isLive: boolean;
		profileImageURL: string;
	}

	let { open = $bindable(false) } = $props();

	let value = $state("");
	let suggestions = $state<Suggestion[]>([]);

	const suggest = debounce(search, 300);

	$effect(() => {
		if (value) suggest(value);
	});

	async function search(query: string) {
		suggestions = [];

		if (!query) return;

		const response = await fetch("https://gql.twitch.tv/gql", {
			method: "POST",
			headers: {
				"Client-Id": "kimne78kx3ncx6brgo4mv6wki5h1ko",
			},
			body: JSON.stringify({
				query: `query {
					searchSuggestions(queryFragment: "${query}", withOfflineChannelContent: true) {
						edges {
							node {
								text
								content {
									__typename
									... on SearchSuggestionChannel {
										id
										isLive
										profileImageURL(width: 50)
										user {
											displayName
										}
									}
								}
							}
						}
					}
				}`,
			}),
		});

		if (!response.ok) return;

		const { data } = await response.json();

		for (const { node } of data.searchSuggestions.edges) {
			if (node.content?.__typename !== "SearchSuggestionChannel") continue;

			suggestions.push({
				displayName: node.content.user.displayName,
				...node.content,
			});
		}
	}

	async function join(event: SubmitEvent) {
		event.preventDefault();

		const form = event.currentTarget as HTMLFormElement;
		const input = form.elements.namedItem("name") as HTMLInputElement;

		const existing = app.channels.find((c) => c.user.username === input.value.toLowerCase());

		settings.state.lastJoined = existing?.user.username ?? `ephemeral:${input.value}`;
		open = false;
	}
</script>

<Dialog.Root
	onOpenChange={(open) => {
		if (!open) {
			value = "";
			suggestions = [];
		}
	}}
	bind:open
>
	<Dialog.Portal>
		<Dialog.Overlay
			class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50"
		/>

		<Dialog.Content
			class="bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-1/2 left-1/2 z-50 grid w-full max-w-md -translate-x-1/2 -translate-y-1/2 gap-4 rounded-lg border p-4 shadow-lg duration-200"
		>
			<div>
				<Dialog.Title class="text-xl font-semibold">Join a channel</Dialog.Title>

				<p class="text-muted-foreground text-sm">
					This channel will only last during the current session. Qutting the application
					will automatically leave the channel and remove it from the channel list.
				</p>
			</div>

			<form class="space-y-4" onsubmit={join}>
				<Combobox.Root type="single" loop onValueChange={(v) => (value = v)}>
					<div>
						<label class="mb-1.5 block text-sm font-medium" for="name">
							Channel name
						</label>

						<Combobox.Input id="name">
							{#snippet child({ props })}
								<Input
									type="text"
									autocapitalize="off"
									autocorrect="off"
									bind:value
									{...props}
								/>
							{/snippet}
						</Combobox.Input>
					</div>

					{#if suggestions.length}
						<Combobox.Content
							class="bg-card mt-2 max-h-72 w-[var(--bits-combobox-anchor-width)] min-w-[var(--bits-combobox-anchor-width)] overflow-y-auto rounded-lg border p-1"
						>
							{#each suggestions as suggestion (suggestion.id)}
								<Combobox.Item
									class="data-highlighted:bg-accent flex cursor-pointer items-center gap-2 rounded-md px-1 py-1"
									value={suggestion.displayName}
								>
									<img
										class="size-6 rounded-full"
										src={suggestion.profileImageURL}
										alt={suggestion.displayName}
									/>

									<div class="flex w-full items-center justify-between">
										<span class="text-sm">{suggestion.displayName}</span>

										{#if suggestion.isLive}
											<div class="flex items-center text-red-500">
												<div
													class="mr-1 size-2 animate-pulse rounded-full bg-current"
												></div>
												<span class="text-sm font-medium">Live</span>
											</div>
										{/if}
									</div>
								</Combobox.Item>
							{/each}
						</Combobox.Content>
					{/if}

					<div class="flex justify-end">
						<button
							class="bg-twitch rounded-md px-3.5 py-2 text-sm font-medium text-white"
							type="submit"
						>
							Join
						</button>
					</div>
				</Combobox.Root>
			</form>
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>
