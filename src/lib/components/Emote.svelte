<script lang="ts">
	import type { Emote } from "$lib/tauri";
	import Tooltip from "./ui/Tooltip.svelte";

	interface Props {
		emote: Emote;
		overlays: Emote[];
	}

	const { emote, overlays }: Props = $props();
	const srcset = emote.srcset.join(", ");
</script>

<Tooltip triggerClass="-my-2 inline-grid align-middle" side="top" sideOffset={4}>
	{#snippet trigger()}
		<img
			class="col-start-1 row-start-1 object-contain"
			{srcset}
			alt={emote.name}
			decoding="async"
		/>

		{#each overlays as overlay}
			<img
				class="col-start-1 row-start-1 m-auto object-contain"
				srcset={overlay.srcset.join(", ")}
				alt={overlay.name}
				decoding="async"
			/>
		{/each}
	{/snippet}

	<div class="flex flex-col items-center">
		<img {srcset} alt={emote.name} width={emote.width} height={emote.height} decoding="async" />
		{emote.name}
	</div>
</Tooltip>
