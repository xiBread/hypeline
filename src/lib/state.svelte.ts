import { SvelteMap } from "svelte/reactivity";
import type { Channel, Emote } from "./channel.svelte";
import type { User } from "./user";

class AppState {
	#joined = $state<Channel | null>(null);

	public user?: User;

	public readonly globalEmotes = new SvelteMap<string, Emote>();

	/**
	 * The currently joined channel.
	 */
	public get joined() {
		return this.#joined;
	}

	public setActive(channel: Channel) {
		this.#joined = channel;
		return this;
	}
}

export const app = new AppState();
