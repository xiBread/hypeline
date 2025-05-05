<script lang="ts">
	import { Label, Switch } from "bits-ui";
	import type { Snippet } from "svelte";
	import { cn } from "$lib/util";

	interface Props {
		children?: Snippet;
		class?: string;
		checked?: boolean;
	}

	let {
		children,
		class: className,
		checked = $bindable(false),
	}: Props = $props();
</script>

<Label.Root
	class={cn(
		"flex items-center justify-between hover:cursor-pointer",
		className,
	)}
>
	<span class="text-sm font-medium">
		{@render children?.()}
	</span>

	<Switch.Root
		class="data-[state=checked]:bg-twitch data-[state=unchecked]:bg-input h-6 w-11 items-center rounded-full border-2 border-transparent transition-colors"
		bind:checked
	>
		<Switch.Thumb
			class="pointer-events-none block size-4.5 rounded-full bg-white shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0.5"
		/>
	</Switch.Root>
</Label.Root>
