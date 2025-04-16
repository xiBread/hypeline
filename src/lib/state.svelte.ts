import type WebSocket from "@tauri-apps/plugin-websocket";
import { RuneStore } from "@tauri-store/svelte";
import type { AuthUser } from "./auth-user.svelte";
import { Channel } from "./channel.svelte";
import type { Emote } from "./channel.svelte";

interface AppState {
	loading: boolean;
	ws?: WebSocket;
	wsSessionId?: string;
	user?: AuthUser;
	active: Channel;
	globalEmotes: Map<string, Emote>;
}

export const app = $state<AppState>({
	loading: true,
	active: Channel.empty(),
	globalEmotes: new Map(),
});

// eslint-disable-next-line ts/consistent-type-definitions
export type Settings = {
	user: { id: string; token: string } | null;
	lastJoined: string | null;
	timeFormat: "auto" | "12" | "24";
};

export const settings = new RuneStore<Settings>("settings", {
	user: null,
	lastJoined: null,
	timeFormat: "auto",
});
