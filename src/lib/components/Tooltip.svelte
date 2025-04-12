<script lang="ts">
	import { Tooltip } from "bits-ui";
	import type { Snippet } from "svelte";
	import { cn } from "$lib/util";

	interface Props extends Tooltip.ContentProps {
		trigger: Snippet;
		open?: boolean;
	}

	let {
		children,
		trigger,
		class: className = "",
		open = $bindable(false),
		...rest
	}: Props = $props();
</script>

<Tooltip.Root bind:open>
	<Tooltip.Trigger>{@render trigger()}</Tooltip.Trigger>

	<Tooltip.Portal>
		<Tooltip.Content
			class={cn(
				"bg-muted rounded-md border p-2 text-sm shadow",
				"data-[state$=open]:animate-in data-[state$=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=closed]:animate-out duration-75",
				className,
			)}
			{...rest}
		>
			{@render children?.()}
		</Tooltip.Content>
	</Tooltip.Portal>
</Tooltip.Root>
