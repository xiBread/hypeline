<script lang="ts">
	import { Select as SelectPrimitive } from "bits-ui";
	import type { WithoutChild } from "bits-ui";
	import { cn } from "$lib/util";

	let {
		ref = $bindable(null),
		class: className,
		value,
		label,
		children: childrenProp,
		...restProps
	}: WithoutChild<SelectPrimitive.ItemProps> = $props();
</script>

<SelectPrimitive.Item
	bind:ref
	{value}
	data-slot="select-item"
	class={cn(
		"data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
		className,
	)}
	{...restProps}
>
	{#snippet children({ selected, highlighted })}
		<span
			class="absolute right-2 flex size-3.5 items-center justify-center"
		>
			{#if selected}
				<span
					class="iconify lucide--check text-muted-foreground pointer-events-none size-4 shrink-0"
				></span>
			{/if}
		</span>
		{#if childrenProp}
			{@render childrenProp({ selected, highlighted })}
		{:else}
			{label || value}
		{/if}
	{/snippet}
</SelectPrimitive.Item>
