<script lang="ts" module>
	import type { UserMessage } from "$lib/message";

	export const replyTarget = $state<{ value: UserMessage | null }>({
		value: null,
	});

	export const input = $state<{ value: HTMLInputElement | null }>({
		value: null,
	});
</script>

<script lang="ts">
	import { onMount } from "svelte";
	import type { HTMLInputAttributes } from "svelte/elements";
	import EmotePicker from "./EmotePicker.svelte";
	import Message from "./message/Message.svelte";
	import Input from "./ui/Input.svelte";

	const { class: className, ...rest }: HTMLInputAttributes = $props();

	let chatInput = $state<HTMLInputElement | null>(null);
	let anchor = $state<HTMLElement>();

	let emotePickerOpen = $state(false);

	onMount(() => {
		input.value = chatInput;
	});
</script>

<EmotePicker input={chatInput} {anchor} bind:open={emotePickerOpen} />

{#if replyTarget.value}
	<div
		class="bg-muted rounded-t-md border border-b-0 px-3 pt-1.5 pb-2 text-sm"
	>
		<div class="flex items-center justify-between">
			<span class="text-muted-foreground">Replying to:</span>

			<button
				type="button"
				aria-label="Cancel reply"
				onclick={() => (replyTarget.value = null)}
			>
				<span
					class="text-muted-foreground hover:text-foreground lucide--circle-x iconify size-4 transition-colors duration-150"
				></span>
			</button>
		</div>

		<div class="mt-2">
			<Message message={replyTarget.value} />
		</div>
	</div>
{/if}

<div class="relative">
	<Input
		class={[
			"focus-visible:ring-twitch focus-visible:border-twitch h-12 focus-visible:ring-1",
			replyTarget.value && "rounded-b-none",
			className,
		]}
		type="text"
		autocapitalize="off"
		autocorrect="off"
		maxlength={500}
		placeholder="Send a message"
		{...rest}
		bind:ref={chatInput}
	/>

	<div class="absolute inset-y-0 end-0 flex p-1">
		<button
			class="text-muted-foreground hover:text-foreground flex size-10 items-center justify-center rounded-sm transition-colors duration-150"
			type="button"
			onclick={() => (emotePickerOpen = !emotePickerOpen)}
			aria-label="Open emote picker"
			bind:this={anchor}
		>
			<span class="iconify lucide--smile size-5"></span>
		</button>
	</div>
</div>
