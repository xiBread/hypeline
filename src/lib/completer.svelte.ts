import Fuse from "fuse.js";
import type { Suggestion } from "./components/Suggestions.svelte";
import type { Emote } from "./tauri";
import type { User } from "./user.svelte";

interface CompleterSource {
	emotes: Emote[];
	viewers: User[];
}

Fuse.config.distance = 10;
Fuse.config.isCaseSensitive = true;
Fuse.config.threshold = 0.5;

export class Completer {
	#emoteFuse: Fuse<Emote>;
	#userFuse: Fuse<User>;

	public query = "";
	public prefixed = false;

	public current = $state(0);
	public suggestions = $state<Suggestion[]>([]);

	public constructor(
		public readonly input: HTMLInputElement,
		source: CompleterSource,
	) {
		this.#emoteFuse = new Fuse(source.emotes, {
			keys: ["name"],
		});

		this.#userFuse = new Fuse(source.viewers, {
			keys: ["username", "displayName"],
		});
	}

	public complete(reset = true) {
		const suggestion = this.suggestions[this.current];
		let end = this.input.value.lastIndexOf(this.query);

		if (this.query.startsWith("@")) {
			end++;
		}

		const left = this.input.value.slice(0, end);
		const right = this.input.value.slice(end + this.query.length);

		this.input.value = `${left + suggestion.display} ${right}`;
		this.input.focus();

		setTimeout(() => {
			const endPos = end + suggestion.display.length + 1;
			this.input.setSelectionRange(endPos, endPos);
		}, 0);

		if (reset) {
			this.prefixed = false;
			this.query = "";
			this.suggestions = [];
			this.current = 0;
		} else {
			this.query = suggestion.display;
		}
	}

	public search(event: { currentTarget: HTMLInputElement }, tab = false) {
		const text = event.currentTarget.value;
		const cursor = event.currentTarget.selectionStart ?? text.length;

		const left = text.slice(0, cursor);
		const lastWord = left.split(" ").pop();

		if (!lastWord) {
			this.suggestions = [];
			return;
		}

		this.query = lastWord;

		if (this.query.startsWith("@")) {
			this.prefixed = true;
			this.suggestions = this.#searchViewers();
		} else if (this.query.startsWith(":")) {
			this.prefixed = true;
			this.suggestions = this.#searchEmotes();
		} else if (tab) {
			this.suggestions = [...this.#searchEmotes(), ...this.#searchViewers()];
		}
	}

	public next() {
		this.current = (this.current + 1) % this.suggestions.length;
	}

	public prev() {
		this.current = (this.current - 1 + this.suggestions.length) % this.suggestions.length;
	}

	#searchEmotes() {
		const results = this.#emoteFuse.search(this.query.slice(1), { limit: 25 });

		return results.map(({ item }) => ({
			type: "emote" as const,
			value: item.name,
			display: item.name,
			imageUrl: item.srcset[1].split(" ")[0],
		}));
	}

	#searchViewers() {
		const results = this.#userFuse.search(this.query.slice(1), { limit: 25 });

		return results.map(({ item }) => ({
			type: "user" as const,
			value: item.username,
			display: item.displayName,
			style: item.style,
		}));
	}
}
