import { invoke } from "@tauri-apps/api/core";
import { SvelteMap } from "svelte/reactivity";
import { Chat } from "./chat.svelte";
import type { JoinedChannel } from "./tauri";
import type { Badge, BadgeSet, Stream } from "./twitch/api";
import { User } from "./user";

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
		public readonly user: User,
		public stream: Stream | null = null,
	) {}

	public static empty() {
		const emptyUser = new User({
			data: {
				id: "",
				login: "",
				display_name: "",
				type: "",
				broadcaster_type: "",
				description: "",
				profile_image_url: "",
				offline_image_url: "",
				created_at: "",
			},
			color: null,
		});

		return new Channel(emptyUser);
	}

	public static async join(id: string, sessionId: string) {
		const joined = await invoke<JoinedChannel>("join", {
			sessionId,
			id,
		});

		const user = new User(joined.user);

		const channel = new Channel(user)
			.addBadges(joined.badges)
			.addEmotes(joined.emotes)
			.setStream(joined.stream);

		channel.chat.users.set(user.id, {
			id: user.id,
			name: user.displayName,
			color: user.color,
		});

		// todo: probably another bottleneck
		await channel.chat.loadUsers();

		return channel;
	}

	public get color() {
		return this.user.color;
	}

	public async leave() {
		await invoke("leave");

		this.badges.clear();
		this.emotes.clear();
		this.chat.users.clear();
	}

	public addBadges(badges: BadgeSet[]) {
		for (const set of badges) {
			const badges: Record<string, Badge> = {};

			for (const version of set.versions) {
				badges[version.id] = version;
			}

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

	public setStream(stream: Stream | null) {
		this.stream = stream;
		return this;
	}
}
