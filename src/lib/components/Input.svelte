<script lang="ts">
	import Smile from "@lucide/svelte/icons/smile";
	import type { HTMLInputAttributes } from "svelte/elements";
	import { cn } from "$lib/util";
	import EmotePicker from "./EmotePicker.svelte";

	const { class: className, type, ...rest }: HTMLInputAttributes = $props();

	let input = $state<HTMLInputElement>();
	let anchor = $state<HTMLElement>();

	let emotePickerOpen = $state(false);
</script>

<EmotePicker {input} {anchor} bind:open={emotePickerOpen} />

<div class="relative">
	<input
		class={cn(
			"placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-12 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-sm transition-[color] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
			"focus-visible:border-ring",
			"aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
			className,
		)}
		{type}
		{...rest}
		bind:this={input}
	/>

	<div class="absolute inset-y-0 end-0 flex p-1">
		<button
			class="text-muted-foreground hover:text-foreground flex size-10 items-center justify-center rounded-sm transition-colors duration-150"
			type="button"
			onclick={() => (emotePickerOpen = !emotePickerOpen)}
			bind:this={anchor}
		>
			<Smile class="size-5" />
		</button>
	</div>
</div>
