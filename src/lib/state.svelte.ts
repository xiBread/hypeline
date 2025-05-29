import { SvelteMap, SvelteSet } from "svelte/reactivity";
import type { Channel } from "./channel.svelte";
import type { Paint } from "./seventv";
import type { Emote } from "./tauri";
import type { Badge } from "./twitch/api";
import type { User } from "./user";

class AppState {
	#joined = $state<Channel | null>(null);

	public user?: User;

	/**
	 * A set of user-joined channels that only exist during the current
	 * application session.
	 */
	public readonly ephemeral = new SvelteSet<Channel>();

	public readonly globalEmotes = new SvelteMap<string, Emote>();
	public readonly globalBadges = new SvelteMap<string, Record<string, Badge>>();
	public readonly badges = new SvelteMap<string, Badge>();
	public readonly paints = new SvelteMap<string, Paint>();

	// Associating a (u)sername to a 7TV (b)adge or (p)aint.
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
