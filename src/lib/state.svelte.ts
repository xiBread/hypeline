import type WebSocket from "@tauri-apps/plugin-websocket";
import { RuneStore } from "@tauri-store/svelte";
import type { ChatUser, Emote } from "./chat";
import type { Message } from "./message";
import type { AuthUser, Badge, FollowedChannel } from "./twitch";

interface AppState {
	loading: boolean;
	ws?: WebSocket;
	wsSessionId?: string;
	channels: FollowedChannel[];
}

export const app = $state<AppState>({
	loading: true,
	channels: [],
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

export interface ChatState {
	channelId: string;
	badges: Map<string, Record<string, Badge>>;
	emotes: Map<string, Emote>;
	messages: Message[];
	users: Map<string, ChatUser>;
}

export const chat = $state<ChatState>({
	channelId: "",
	badges: new Map(),
	emotes: new Map(),
	messages: [],
	users: new Map(),
});
