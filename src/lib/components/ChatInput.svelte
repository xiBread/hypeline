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
	import type {
		FormEventHandler,
		HTMLInputAttributes,
		KeyboardEventHandler,
	} from "svelte/elements";
	import { app } from "$lib/state.svelte";
	import EmotePicker from "./EmotePicker.svelte";
	import Message from "./message/Message.svelte";
	import Suggestions from "./Suggestions.svelte";
	import type { Suggestion } from "./Suggestions.svelte";
	import Input from "./ui/Input.svelte";

	const { class: className, ...rest }: HTMLInputAttributes = $props();

	let chatInput = $state<HTMLInputElement | null>(null);
	let anchor = $state<HTMLElement>();

	let emotePickerOpen = $state(false);
	let historyCursor = $state(-1);
	let value = $state("");

	let suggestions = $state<Suggestion[]>([]);
	let showSuggestions = $derived(suggestions.length > 0);

	let currentQuery = "";
	let trigger: string | null = null;
	let triggerPosition = -1;

	onMount(() => {
		input.value = chatInput;
	});

	function applySuggestion(suggestion: Suggestion) {
		const left = value.slice(0, triggerPosition);
		const right = value.slice(triggerPosition + 1 + currentQuery.length);

		value = left + suggestion.display + " " + right;

		suggestions = [];
		trigger = null;
		currentQuery = "";

		if (input.value) {
			input.value.focus();

			setTimeout(() => {
				const newCursorPos = triggerPosition + suggestion.display.length + 1;
				input.value?.setSelectionRange(newCursorPos, newCursorPos);
			}, 0);
		}
	}

	const filter: FormEventHandler<HTMLInputElement> = (event) => {
		if (!app.joined) return;

		const text = event.currentTarget.value;

		if (!text) {
			suggestions = [];
			return;
		}

		const cursor = event.currentTarget.selectionStart ?? text.length;
		const left = text.slice(0, cursor);

		const lastSpaceIndex = left.lastIndexOf(" ");
		const currentSegment = left.slice(lastSpaceIndex + 1);

		let potentialTrigger = null;
		let query = "";
		let foundTriggerPos = -1;

		const atIndex = currentSegment.lastIndexOf("@");
		const colonIndex = currentSegment.lastIndexOf(":");

		if (atIndex !== -1 && (colonIndex === -1 || atIndex > colonIndex)) {
			if (cursor - (lastSpaceIndex + 1 + atIndex) > 0) {
				query = currentSegment.slice(atIndex + 1);

				if (!query.includes(" ")) {
					potentialTrigger = "@";
					foundTriggerPos = lastSpaceIndex + 1 + atIndex;
				}
			}
		} else if (colonIndex !== -1) {
			if (cursor - (lastSpaceIndex + 1 + colonIndex) > 0) {
				query = currentSegment.slice(colonIndex + 1);

				if (!query.includes(" ")) {
					potentialTrigger = ":";
					foundTriggerPos = lastSpaceIndex + 1 + colonIndex;
				}
			}
		}

		if (potentialTrigger && query.length > 0) {
			const filtered: Suggestion[] = [];

			trigger = potentialTrigger;
			triggerPosition = foundTriggerPos;
			currentQuery = query.toLowerCase();

			if (trigger === ":") {
				for (const [name, emote] of app.joined.emotes) {
					if (name.toLowerCase().includes(currentQuery) && filtered.length < 25) {
						filtered.push({
							type: "emote",
							value: name,
							display: name,
							imageUrl: emote.srcset[1].split(" ")[0],
						});
					}
				}
			} else if (trigger === "@") {
				for (const [username, viewer] of app.joined.viewers) {
					if (username.includes(currentQuery) && filtered.length < 25) {
						filtered.push({
							type: "user",
							value: username,
							display: viewer.displayName,
						});
					}
				}
			}

			suggestions = filtered;
		} else {
			trigger = null;
			triggerPosition = -1;
			currentQuery = "";
		}
	};

	const send: KeyboardEventHandler<HTMLInputElement> = async (event) => {
		if (!app.joined) return;

		const input = event.currentTarget;

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

			app.joined.history.push(message);
			await app.joined.send(message);

			historyCursor = -1;
			replyTarget.value = null;
		}
	};
</script>

<Suggestions anchor={chatInput} open={showSuggestions} {suggestions} onselect={applySuggestion} />
<EmotePicker {anchor} input={chatInput} bind:open={emotePickerOpen} />

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
		oninput={filter}
		onkeydown={send}
		{...rest}
		bind:ref={chatInput}
		bind:value
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
