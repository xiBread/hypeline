import type { Suggestion } from "./components/Suggestions.svelte";
import type { Emote } from "./tauri";
import type { User } from "./user.svelte";

interface CompleterSource {
	emotes: Emote[];
	viewers: User[];
}

interface SearchOptions<T> {
	tab: boolean;
	source: T[];
	comparee: (item: T) => string;
	map: (item: T) => Suggestion;
}

export class Completer {
	#source: CompleterSource;

	public query = "";
	public prefixed = false;

	public current = $state(0);
	public suggestions = $state<Suggestion[]>([]);

	public constructor(
		public readonly input: HTMLInputElement,
		source: CompleterSource,
	) {
		this.#source = source;
	}

	public complete(reset = true) {
		const suggestion = this.suggestions[this.current];
		let end = this.input.value.lastIndexOf(this.query);

		if (this.query.startsWith("@")) {
			end++;
		}

		const left = this.input.value.slice(0, end);
		const right = this.input.value.slice(end + this.query.length);

		this.input.value = `${left + suggestion.display} ${right.trim()}`;
		this.input.focus();

		const endPos = end + suggestion.display.length + 1;
		this.input.setSelectionRange(endPos, endPos);

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
			this.suggestions = [...this.#searchEmotes(true), ...this.#searchViewers(true)];
		}
	}

	public next() {
		this.current = (this.current + 1) % this.suggestions.length;
	}

	public prev() {
		this.current = (this.current - 1 + this.suggestions.length) % this.suggestions.length;
	}

	#search<T>(options: SearchOptions<T>) {
		const searchFunction = options.tab ? "startsWith" : "includes";
		const query = options.tab ? this.query : this.query.slice(1);

		if (!query) return [];

		return options.source
			.filter((item) =>
				options.comparee(item).toLowerCase()[searchFunction](query.toLowerCase()),
			)
			.slice(0, 25)
			.map(options.map);
	}

	#searchEmotes(tab = false) {
		return this.#search<Emote>({
			tab,
			source: this.#source.emotes,
			comparee: (item) => item.name,
			map: (item) => ({
				type: "emote" as const,
				value: item.name,
				display: item.name,
				imageUrl: item.srcset[1].split(" ")[0],
			}),
		});
	}

	#searchViewers(tab = false) {
		return this.#search<User>({
			tab,
			source: this.#source.viewers,
			comparee: (item) => item.username,
			map: (item) => ({
				type: "user" as const,
				value: item.username,
				display: item.displayName,
				style: item.style,
			}),
		});
	}
}
