import type { Emote } from "./chat";
import { type AuthUser, type Badge } from "./twitch-api";

interface AppState {
	loading: boolean;
	wsSessionId?: string;
}

export const app = $state<AppState>({
	loading: true,
});

export interface Settings {
	user: AuthUser | undefined;
}

export const settings = $state<Settings>({
	user: undefined,
});

export interface ChatState {
	channelId: string;
	badges: Map<string, Record<string, Badge>>;
	emotes: Map<string, Emote>;
}

export const chat = $state<ChatState>({
	channelId: "",
	badges: new Map(),
	emotes: new Map(),
});
