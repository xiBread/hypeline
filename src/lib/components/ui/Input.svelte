<script lang="ts">
	import type { WithElementRef } from "bits-ui";
	import type { HTMLInputAttributes } from "svelte/elements";
	import { cn } from "$lib/util";

	type Props = WithElementRef<HTMLInputAttributes>;

	let {
		ref = $bindable(null),
		value = $bindable(),
		type,
		files = $bindable(),
		class: className,
		...restProps
	}: Props = $props();
</script>

<input
	bind:this={ref}
	class={cn(
		"border-input bg-background selection:bg-primary dark:bg-input/30 selection:text-primary-foreground ring-offset-background placeholder:text-muted-foreground flex h-9 w-full min-w-0 rounded-md border px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
		"focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
		"aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
		className,
	)}
	{type}
	bind:value
	{...restProps}
/>
