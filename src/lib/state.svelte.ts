import { SvelteMap } from "svelte/reactivity";
import type { Channel, Emote } from "./channel.svelte";
import type { Badge } from "./twitch/api";
import type { User } from "./user";

class AppState {
	#joined = $state<Channel | null>(null);

	public user?: User;

	public readonly globalEmotes = new SvelteMap<string, Emote>();
	public readonly globalBadges = new SvelteMap<string, Record<string, Badge>>();

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
