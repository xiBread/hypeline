import { SvelteMap } from "svelte/reactivity";
import type { Channel, Emote } from "./channel.svelte";
import type { Paint } from "./seventv";
import type { Badge } from "./twitch/api";
import type { User } from "./user";

class AppState {
	#joined = $state<Channel | null>(null);

	public user?: User;

	public readonly globalEmotes = new SvelteMap<string, Emote>();
	public readonly globalBadges = new SvelteMap<string, Record<string, Badge>>();
	public readonly badges = new SvelteMap<string, Badge>();
	public readonly paints = new SvelteMap<string, Paint>();

	// Associating a (u)sername to a &TV (b)adge or (p)aint.
	public readonly u2b = new Map<string, Badge | undefined>();
	public readonly u2p = new Map<string, Paint | undefined>();

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
