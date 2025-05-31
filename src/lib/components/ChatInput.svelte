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
	import { app } from "$lib/state.svelte";
	import EmotePicker from "./EmotePicker.svelte";
	import Message from "./message/Message.svelte";
	import Input from "./ui/Input.svelte";

	const { class: className, ...rest }: HTMLInputAttributes = $props();

	let chatInput = $state<HTMLInputElement | null>(null);
	let anchor = $state<HTMLElement>();

	let emotePickerOpen = $state(false);
	let historyCursor = $state(-1);

	onMount(() => {
		input.value = chatInput;
	});

	async function send(event: KeyboardEvent) {
		if (!app.joined) return;

		const input = event.currentTarget as HTMLInputElement;

		if (event.key === "Escape" && replyTarget.value) {
			replyTarget.value = null;
		} else if (event.key === "ArrowUp") {
			if (!app.joined.history.length) return;

			if (historyCursor === -1) {
				historyCursor = app.joined.history.length - 1;
			} else if (historyCursor > 0) {
				historyCursor--;
			}

			input.value = app.joined.history[historyCursor];

			setTimeout(() => {
				input.setSelectionRange(input.value.length, input.value.length);
			}, 0);
		} else if (event.key === "ArrowDown") {
			if (historyCursor === -1) return;

			if (historyCursor < app.joined.history.length - 1) {
				historyCursor++;
				input.value = app.joined.history[historyCursor];
			} else {
				historyCursor = -1;
				input.value = "";
			}

			input.setSelectionRange(input.value.length, input.value.length);
		} else if (event.key === "Enter") {
			event.preventDefault();

			const message = input.value.trim();

			if (!message) return;
			if (!event.ctrlKey) input.value = "";

			replyTarget.value = null;
			historyCursor = -1;

			app.joined.history.push(message);
			await app.joined.send(message);
		}
	}
</script>

<EmotePicker input={chatInput} {anchor} bind:open={emotePickerOpen} />

{#if replyTarget.value}
	<div
		class="bg-muted/50 border-muted has-[+div>input:focus-visible]:border-input rounded-t-md border border-b-0 px-3 pt-1.5 pb-2.5 text-sm transition-colors duration-200"
	>
		<div class="flex items-center justify-between">
			<span class="text-muted-foreground">Replying to:</span>

			<button
				type="button"
				aria-label="Cancel reply"
				onclick={() => (replyTarget.value = null)}
			>
				<span
					class="text-muted-foreground hover:text-foreground lucide--circle-x iconify block size-4 transition-colors duration-150"
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
			"focus-visible:border-input border-muted h-12 pr-10 transition-colors duration-200 focus-visible:ring-0",
			replyTarget.value && "rounded-t-none",
			className,
		]}
		type="text"
		autocapitalize="off"
		autocorrect="off"
		maxlength={500}
		placeholder="Send a message"
		onkeydown={send}
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
