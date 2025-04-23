import type WebSocket from "@tauri-apps/plugin-websocket";
import { SvelteMap } from "svelte/reactivity";
import { Channel } from "./channel.svelte";
import type { Emote } from "./channel.svelte";
import type { User } from "./user";

class AppState {
	#active = $state<Channel>();

	public loading = $state(true);
	public ws?: WebSocket;
	public wsSessionId?: string;
	public user?: User;

	public readonly globalEmotes = new SvelteMap<string, Emote>();

	/**
	 * The currently joined channel.
	 */
	public get active() {
		return this.#active ?? Channel.empty();
	}

	public set active(channel: Channel) {
		this.#active = channel;
	}
}

export const app = new AppState();
