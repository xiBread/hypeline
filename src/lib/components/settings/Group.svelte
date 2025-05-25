<script lang="ts">
	import type { Snippet } from "svelte";

	interface Props {
		children?: Snippet;
		description?: Snippet;
		title: string;
		nested?: boolean;
	}

	const { children, description, title, nested = false }: Props = $props();
	const heading = nested ? "h3" : "h2";
</script>

<div>
	<div class={nested ? "mb-2" : "mb-6"}>
		{#if description}
			<hgroup>
				<svelte:element this={heading} class="mb-2">
					{title}
				</svelte:element>

				<p class="text-muted-foreground text-sm">
					{@render description()}
				</p>
			</hgroup>
		{:else}
			<svelte:element this={heading}>
				{title}
			</svelte:element>
		{/if}
	</div>

	<div class="space-y-6">
		{@render children?.()}
	</div>
</div>
