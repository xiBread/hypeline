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
	import Fuse from "fuse.js";
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

	const emoteFuse = new Fuse(app.joined?.emotes.values().toArray() ?? [], {
		isCaseSensitive: true,
		keys: ["name"],
	});

	const userFuse = new Fuse(app.joined?.viewers.values().toArray() ?? [], {
		isCaseSensitive: true,
		keys: ["username", "displayName"],
	});

	let chatInput = $state<HTMLInputElement | null>(null);
	let anchor = $state<HTMLElement>();

	let emotePickerOpen = $state(false);
	let historyIdx = $state(-1);
	let value = $state("");

	let suggestions = $state<Suggestion[]>([]);
	let suggestionIdx = $state(0);
	const showSuggestions = $derived(suggestions.length > 0);

	let currentQuery = "";
	let trigger: string | null = null;
	let triggerPosition = -1;

	onMount(() => {
		input.value = chatInput;
	});

	function applySuggestion(suggestion: Suggestion) {
		let replaceLength = currentQuery.length;

		if (trigger === "@" || trigger === ":") {
			replaceLength++;
		}

		const left = value.slice(0, triggerPosition);
		const right = value.slice(triggerPosition + replaceLength);

		value = `${left + suggestion.display} ${right}`;

		suggestions = [];
		suggestionIdx = 0;
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

	function searchEmotes(query: string) {
		const results: Suggestion[] = [];
		if (!app.joined) return results;

		const hits = emoteFuse.search(query, { limit: 25 });

		for (const hit of hits) {
			results.push({
				type: "emote",
				value: hit.item.name,
				display: hit.item.name,
				imageUrl: hit.item.srcset[1].split(" ")[0],
			});
		}

		return results;
	}

	function searchViewers(query: string) {
		const results: Suggestion[] = [];
		if (!app.joined) return results;

		const hits = userFuse.search(query, { limit: 25 });

		for (const hit of hits) {
			results.push({
				type: "user",
				value: hit.item.username,
				display: hit.item.displayName,
				style: hit.item.style,
			});
		}

		return results;
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

		if (!currentSegment) {
			suggestions = [];
			return;
		}

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
					foundTriggerPos = lastSpaceIndex + 1 + atIndex + 1;
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

		if (trigger === "tab" && !potentialTrigger) {
			suggestions = [];
			trigger = null;
			currentQuery = "";
			triggerPosition = -1;
		}

		if (potentialTrigger && query.length > 0) {
			const filtered: Suggestion[] = [];

			trigger = potentialTrigger;
			triggerPosition = foundTriggerPos;
			currentQuery = query;

			if (trigger === ":") {
				filtered.push(...searchEmotes(currentSegment));
			} else if (trigger === "@") {
				filtered.push(...searchViewers(currentSegment));
			}

			suggestions = filtered;
		} else if (trigger !== "tab") {
			trigger = null;
			triggerPosition = -1;
			currentQuery = "";
		}
	};

	const send: KeyboardEventHandler<HTMLInputElement> = async (event) => {
		if (!app.joined) return;

		const input = event.currentTarget;

		if (event.key === "Tab") {
			if (showSuggestions) {
				event.preventDefault();
				applySuggestion(suggestions[suggestionIdx]);
			} else {
				const cursor = input.selectionStart ?? value.length;
				const left = value.slice(0, cursor);

				const lastSpaceIndex = left.lastIndexOf(" ");
				const currentSegment = left.slice(lastSpaceIndex + 1);

				if (currentSegment && !currentSegment.includes(" ")) {
					const filtered = searchEmotes(currentSegment);

					if (filtered.length) {
						event.preventDefault();

						suggestions = filtered;
						suggestionIdx = 0;
						trigger = "tab";
						triggerPosition = lastSpaceIndex + 1;
						currentQuery = currentSegment;
					}
				}
			}
		} else if (event.key === "Escape") {
			replyTarget.value = null;
		} else if (event.key === "ArrowUp") {
			if (showSuggestions) {
				event.preventDefault();
				suggestionIdx = (suggestionIdx - 1 + suggestions.length) % suggestions.length;
			} else {
				if (!app.joined.history.length) return;

				if (historyIdx === -1) {
					historyIdx = app.joined.history.length - 1;
				} else if (historyIdx > 0) {
					historyIdx--;
				}

				input.value = app.joined.history[historyIdx];

				setTimeout(() => {
					input.setSelectionRange(input.value.length, input.value.length);
				}, 0);
			}
		} else if (event.key === "ArrowDown") {
			if (showSuggestions) {
				event.preventDefault();
				suggestionIdx = (suggestionIdx + 1) % suggestions.length;
			} else {
				if (historyIdx === -1) return;

				if (historyIdx < app.joined.history.length - 1) {
					historyIdx++;
					input.value = app.joined.history[historyIdx];
				} else {
					historyIdx = -1;
					input.value = "";
				}

				input.setSelectionRange(input.value.length, input.value.length);
			}
		} else if (event.key === "Enter") {
			event.preventDefault();

			if (showSuggestions) {
				applySuggestion(suggestions[suggestionIdx]);
			} else {
				const message = input.value.trim();

				if (!message) return;
				if (!event.ctrlKey) input.value = "";

				const replyId = replyTarget.value?.id;
				replyTarget.value = null;
				historyIdx = -1;

				app.joined.history.push(message);
				await app.joined.send(message, replyId);
			}
		}
	};
</script>

<Suggestions
	anchor={chatInput}
	open={showSuggestions}
	index={suggestionIdx}
	{suggestions}
	onselect={applySuggestion}
/>

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
