<script lang="ts" module>
	export interface Suggestion {
		type: "emote" | "user";
		value: string;
		display: string;
		imageUrl?: string;
	}
</script>

<script lang="ts">
	import { Combobox } from "bits-ui";

	interface Props {
		anchor: HTMLElement | null;
		open: boolean;
		suggestions: Suggestion[];
		onselect: (suggestion: Suggestion) => void;
	}

	let { anchor, open = $bindable(), suggestions, onselect }: Props = $props();
</script>

<Combobox.Root
	type="single"
	onValueChange={(value) => {
		const suggestion = suggestions.find((s) => s.value === value);
		if (suggestion) onselect(suggestion);
	}}
	bind:open
>
	<Combobox.Portal>
		<Combobox.Content
			class="bg-card z-50 max-h-72 w-(--bits-combobox-anchor-width) overflow-y-auto rounded-md border p-1 shadow-lg"
			customAnchor={anchor}
			side="top"
			sideOffset={8}
		>
			{#each suggestions as suggestion (suggestion.value)}
				<Combobox.Item
					class={[
						"flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm outline-none",
						"focus-visible:bg-accent focus-visible:text-accent-foreground",
						"data-highlighted:bg-accent data-highlighted:text-accent-foreground",
					]}
					value={suggestion.value}
				>
					{#if suggestion.imageUrl}
						<img
							class="size-8 object-contain"
							src={suggestion.imageUrl}
							alt={suggestion.display}
						/>
					{/if}

					<span>{suggestion.display}</span>
				</Combobox.Item>
			{/each}
		</Combobox.Content>
	</Combobox.Portal>
</Combobox.Root>
