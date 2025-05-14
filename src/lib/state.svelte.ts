import { SvelteMap } from "svelte/reactivity";
import type { Channel, Emote } from "./channel.svelte";
import type { User } from "./user";

class AppState {
	#active = $state<Channel | null>(null);

	public user?: User;

	public readonly globalEmotes = new SvelteMap<string, Emote>();

	/**
	 * The currently joined channel.
	 */
	public get active() {
		return this.#active;
	}

	public setActive(channel: Channel) {
		this.#active = channel;
		return this;
	}
}

export const app = new AppState();
