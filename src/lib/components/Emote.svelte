<script lang="ts">
	import type { Emote } from "$lib/channel.svelte";
	import Tooltip from "./ui/Tooltip.svelte";

	const { emote }: { emote: Emote } = $props();
	const srcset = emote.srcset.join(", ");
</script>

<Tooltip triggerClass="-my-2 inline-block align-middle" side="top" sideOffset={4}>
	{#snippet trigger()}
		<img class="object-contain" {srcset} alt={emote.name} decoding="async" />
	{/snippet}

	<div class="flex flex-col items-center">
		<img {srcset} alt={emote.name} width={emote.width} height={emote.height} decoding="async" />
		{emote.name}
	</div>
</Tooltip>
