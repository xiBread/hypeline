import type WebSocket from "@tauri-apps/plugin-websocket";
import { RuneStore } from "@tauri-store/svelte";
import { Channel } from "./channel.svelte";
import type { Emote } from "./channel.svelte";
import type { AuthUser, FollowedChannel } from "./twitch/api";

interface AppState {
	loading: boolean;
	ws?: WebSocket;
	wsSessionId?: string;
	active: Channel;
	channels: FollowedChannel[];
	globalEmotes: Map<string, Emote>;
}

export const app = $state<AppState>({
	loading: true,
	active: Channel.empty(),
	channels: [],
	globalEmotes: new Map(),
});

// eslint-disable-next-line ts/consistent-type-definitions
export type Settings = {
	user: AuthUser | null;
	lastJoined: string | null;
};

export const settings = new RuneStore<Settings>("settings", {
	user: null,
	lastJoined: null,
});
