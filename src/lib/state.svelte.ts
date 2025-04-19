import type WebSocket from "@tauri-apps/plugin-websocket";
import { RuneStore } from "@tauri-store/svelte";
import { SvelteMap } from "svelte/reactivity";
import type { AuthUser } from "./auth-user.svelte";
import { Channel } from "./channel.svelte";
import type { Emote } from "./channel.svelte";

class AppState {
	#active = $state<Channel>();

	public loading = $state(true);
	public ws?: WebSocket;
	public wsSessionId?: string;
	public user?: AuthUser;

	public readonly globalEmotes = new SvelteMap<string, Emote>();

	public get active() {
		return this.#active ?? Channel.empty();
	}

	public set active(channel: Channel) {
		this.#active = channel;
	}
}

export const app = new AppState();
