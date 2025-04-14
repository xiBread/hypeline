import { invoke } from "@tauri-apps/api/core";
import { SvelteMap } from "svelte/reactivity";
import { Chat } from "./chat.svelte";
import { app } from "./state.svelte";
import type { Badge, BadgeSet } from "./twitch/api";

export interface Emote {
	name: string;
	url: string;
	width: number;
	height: number;
}

export class Channel {
	public readonly chat = new Chat(this);

	public readonly badges = new SvelteMap<string, Record<string, Badge>>();
	public readonly emotes = new SvelteMap<string, Emote>();

	public constructor(
		public readonly id: string,
		public readonly name: string,
	) {}

	public static async join(channel: string) {
		const data = await invoke<{
			channel_id: string;
			emotes: Record<string, Emote>;
			badges: BadgeSet[];
		}>("join", { sessionId: app.wsSessionId, channel });

		const instance = new Channel(data.channel_id, channel)
			.addBadges(data.badges)
			.addEmotes(data.emotes)
			.addEmotes(app.globalEmotes);

		await instance.chat.fetchUsers();

		return instance;
	}

	public async leave() {
		await invoke("leave");

		this.badges.clear();
		this.emotes.clear();
		this.chat.users.clear();
	}

	public addBadges(badges: BadgeSet[]) {
		for (const set of badges) {
			const badges = set.versions.reduce<Record<string, Badge>>(
				(acc, ver) => ({ ...acc, [ver.id]: ver }),
				{},
			);

			this.badges.set(set.set_id, badges);
		}

		return this;
	}

	public addEmotes(emotes: Record<string, Emote> | Map<string, Emote>) {
		const entries = emotes instanceof Map ? emotes : Object.entries(emotes);

		for (const [name, emote] of entries) {
			this.emotes.set(name, emote);
		}

		return this;
	}
}
