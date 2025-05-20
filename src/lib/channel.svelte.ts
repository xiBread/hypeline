import { invoke } from "@tauri-apps/api/core";
import { SvelteMap } from "svelte/reactivity";
import { replyTarget } from "./components/ChatInput.svelte";
import type { Message } from "./message";
import type { EmoteSet } from "./seventv";
import type { JoinedChannel } from "./tauri";
import type { Badge, BadgeSet, Cheermote, Stream } from "./twitch/api";
import { User } from "./user";
import { Viewer } from "./viewer.svelte";

export interface Emote {
	name: string;
	url: string;
	width: number;
	height: number;
}

export class Channel {
	#lastRecentAt: number | null = null;
	#stream = $state<Stream | null>(null);

	public readonly badges = new SvelteMap<string, Record<string, Badge>>();
	public readonly emotes = new SvelteMap<string, Emote>();
	public readonly cheermotes = $state<Cheermote[]>([]);
	public readonly viewers = new SvelteMap<string, Viewer>();

	/**
	 * The active 7TV emote set for the channel if any.
	 */
	public emoteSet = $state<EmoteSet>();

	/**
	 * An array of messages the user has sent in the channel.
	 */
	public history = $state<string[]>([]);
	public messages = $state<Message[]>([]);

	public constructor(
		/**
		 * The user for the channel.
		 */
		public readonly user: User,
		stream: Stream | null = null,
	) {
		this.#stream = stream;
	}

	public static async join(login: string) {
		const joined = await invoke<JoinedChannel>("join", { login });

		const user = new User(joined.user);

		const channel = new Channel(user)
			.addBadges(joined.badges)
			.addEmotes(joined.emotes)
			.addCheermotes(joined.cheermotes)
			.setStream(joined.stream);

		channel.emoteSet = joined.emote_set ?? undefined;

		const viewer = new Viewer(user);
		viewer.isBroadcaster = true;

		channel.viewers.set(user.username, viewer);

		return channel;
	}

	/**
	 * The stream associated with the channel if it's currently streaming.
	 */
	public get stream() {
		return this.#stream;
	}

	public async leave() {
		await invoke("leave", { channel: this.user.username });
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

	public addCheermotes(cheermotes: Cheermote[]) {
		for (const cheermote of cheermotes) {
			this.cheermotes.push(cheermote);
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

	public addMessage(message: Message) {
		if (this.messages.some((m) => m.id === message.id)) {
			return this;
		}

		if (message.isRecent) {
			if (this.#lastRecentAt === null) {
				this.messages.unshift(message);
				this.#lastRecentAt = 0;
			} else {
				this.messages.splice(this.#lastRecentAt + 1, 0, message);
				this.#lastRecentAt++;
			}
		} else {
			this.messages.push(message);
		}

		return this;
	}

	public clearMessages(id?: string) {
		if (id) {
			for (const message of this.messages) {
				if (message.isUser() && message.viewer.id === id) {
					message.setDeleted();
				}
			}
		} else {
			for (const message of this.messages) {
				// System messages can also be deleted, but there's no reliable
				// way to identify which ones (that doesn't involve more
				// complexity), so they're only deleted if it's recent.
				if (message.isUser()) message.setDeleted();
			}
		}
	}

	public async send(message: string) {
		await invoke("send_message", {
			content: message,
			broadcasterId: this.user.id,
			replyId: replyTarget.value?.id ?? null,
		});
	}

	public setStream(stream: Stream | null) {
		this.#stream = stream;
		return this;
	}
}
