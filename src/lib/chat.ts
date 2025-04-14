import { invoke } from "@tauri-apps/api/core";
import { app, chat } from "./state.svelte";
import type { Badge, BadgeSet } from "./twitch/api";

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

export async function leave() {
	await invoke("leave");

	chat.badges.clear();
	chat.emotes.clear();
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
