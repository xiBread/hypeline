import { SvelteMap } from "svelte/reactivity";
import { Channel } from "./channel.svelte";
import type { Emote } from "./channel.svelte";
import type { User } from "./user";

class AppState {
	#active = $state<Channel>();

	public user?: User;

	public readonly globalEmotes = new SvelteMap<string, Emote>();

	/**
	 * The currently joined channel.
	 */
	public get active() {
		return this.#active ?? Channel.empty();
	}

	public setActive(channel: Channel) {
		this.#active = channel;
		return this;
	}
}

export const app = new AppState();
