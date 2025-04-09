import { RuneStore } from "@tauri-store/svelte";
import type { Emote, Message } from "./chat";
import type { AuthUser, Badge } from "./twitch-api";

interface AppState {
	loading: boolean;
	wsSessionId?: string;
}

export const app = $state<AppState>({
	loading: true,
});

// eslint-disable-next-line ts/consistent-type-definitions
export type Settings = {
	user: AuthUser | null;
};

export const settings = new RuneStore<Settings>("settings", {
	user: null,
});

export interface ChatState {
	channelId: string;
	badges: Map<string, Record<string, Badge>>;
	emotes: Map<string, Emote>;
	messages: Message[];
}

export const chat = $state<ChatState>({
	channelId: "",
	badges: new Map(),
	emotes: new Map(),
	messages: [],
});
