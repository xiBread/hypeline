<script lang="ts">
	import { Select as SelectPrimitive } from "bits-ui";
	import type { WithoutChildrenOrChild } from "bits-ui";
	import { cn } from "$lib/util";

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: WithoutChildrenOrChild<SelectPrimitive.ScrollUpButtonProps> = $props();
</script>

<SelectPrimitive.ScrollUpButton
	bind:ref
	data-slot="select-scroll-down-button"
	class={cn("flex cursor-default items-center justify-center py-1", className)}
	{...restProps}
>
	<span class="iconify lucide--chevron-up size-4"></span>
</SelectPrimitive.ScrollUpButton>
