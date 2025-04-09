import { RuneStore } from "@tauri-store/svelte";
import type { ChatUser, Emote, Message } from "./chat";
import type { AuthUser, Badge, FollowedChannel, User } from "./twitch-api";

interface AppState {
	loading: boolean;
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
};

export const settings = new RuneStore<Settings>("settings", {
	user: null,
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
