<script lang="ts">
	import { Select as SelectPrimitive } from "bits-ui";
	import type { WithoutChildrenOrChild } from "bits-ui";
	import { cn } from "$lib/util";

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: WithoutChildrenOrChild<SelectPrimitive.ScrollDownButtonProps> = $props();
</script>

<SelectPrimitive.ScrollDownButton
	bind:ref
	data-slot="select-scroll-up-button"
	class={cn(
		"flex cursor-default items-center justify-center py-1",
		className,
	)}
	{...restProps}
>
	<span class="iconify lucide--chevron-down size-4"></span>
</SelectPrimitive.ScrollDownButton>
