import { invoke } from "@tauri-apps/api/core";
import { systemPrefersMode, userPrefersMode } from "mode-watcher";
import { SvelteMap } from "svelte/reactivity";
import { fromStore } from "svelte/store";
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

	#color: string | null = null;

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

		const color = await invoke<string | null>("get_user_color", {
			id: data.channel_id,
		});

		const instance = new Channel(data.channel_id, channel)
			.addBadges(data.badges)
			.addEmotes(data.emotes)
			.addEmotes(app.globalEmotes)
			.setColor(color);

		await instance.chat.fetchUsers();

		return instance;
	}

	public get color() {
		if (this.#color) return this.#color;

		const prefers = fromStore(userPrefersMode);
		const system = fromStore(systemPrefersMode);

		const mode =
			prefers.current === "system"
				? (system.current ?? "dark")
				: prefers.current;

		return mode === "dark" ? "#FFFFFF" : "#000000";
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

	public setColor(color: string | null) {
		this.#color = color;

		return this;
	}
}
