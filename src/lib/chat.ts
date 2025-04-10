import { invoke } from "@tauri-apps/api/core";
import { app, chat } from "./state.svelte";
import type { Badge, BadgeSet, ChannelChatMessage } from "./twitch";

export interface Chat {
	channel_id: string;
	emotes: Record<string, Emote>;
	badges: BadgeSet[];
}

export interface Emote {
	name: string;
	url: string;
	width: number;
	height: number;
}

export type Fragment =
	| { type: "text"; value: string }
	| { type: "mention"; id: string; username: string }
	| { type: "url"; text: string; url: URL }
	| ({ type: "emote" } & Emote)
	// todo: cheermotes
	| { type: "cheermote"; value: string };

export interface SystemMessage {
	type: "system";
	text: string;
}

export interface UserMessage extends ChannelChatMessage {
	type: "user";
	fragments: Fragment[];
}

export type Message = SystemMessage | UserMessage;

export async function join(channel: string) {
	const data = await invoke<{
		channel_id: string;
		emotes: Record<string, Emote>;
		badges: BadgeSet[];
	}>("join", { sessionId: app.wsSessionId, channel });

	chat.channelId = data.channel_id;

	for (const set of data.badges) {
		const badges = set.versions.reduce<Record<string, Badge>>(
			(acc, ver) => ({ ...acc, [ver.id]: ver }),
			{},
		);

		chat.badges.set(set.set_id, badges);
	}

	for (const [name, emote] of Object.entries(data.emotes)) {
		chat.emotes.set(name, emote);
	}
}

export interface ChatUser {
	id: string;
	name: string;
	color: string;
}

export async function fetchUsers() {
	const users = await invoke<ChatUser[]>("get_chatters", {
		channelId: chat.channelId,
	});

	for (const user of users) {
		chat.users.set(user.id, user);
	}
}
