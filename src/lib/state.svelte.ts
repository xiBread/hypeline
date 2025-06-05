import { SvelteMap } from "svelte/reactivity";
import type { Channel } from "./channel.svelte";
import type { Paint } from "./seventv";
import type { Emote } from "./tauri";
import type { Badge } from "./twitch/api";
import type { User } from "./user.svelte";

class AppState {
	#joined = $state<Channel | null>(null);

	/**
	 * The currently authenticated user.
	 */
	public user?: User;
	public channels = $state<Channel[]>([]);

	/**
	 * Global emotes from Twitch, 7TV, BTTV, and FFZ.
	 */
	public readonly globalEmotes = new SvelteMap<string, Emote>();

	/**
	 * Global badges from Twitch.
	 */
	public readonly globalBadges = new SvelteMap<string, Record<string, Badge>>();

	/**
	 * Provider-specific badges.
	 */
	public readonly badges = new SvelteMap<string, Badge>();

	/**
	 * 7TV paints.
	 */
	public readonly paints = new SvelteMap<string, Paint>();

	// Associates a (u)ser id to a 7TV (b)adge or (p)aint.
	public readonly u2b = new Map<string, Badge | undefined>();
	public readonly u2p = new Map<string, Paint | undefined>();

	/**
	 * The currently joined channel.
	 */
	public get joined() {
		return this.#joined;
	}

	public setJoined(channel: Channel | null) {
		this.#joined = channel;
		return this;
	}
}

export const app = new AppState();
