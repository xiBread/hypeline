import type { Emote } from "$lib/channel.svelte";
import { app } from "$lib/state.svelte";
import type { CheermoteTier } from "$lib/twitch/api";
import type { AutoModMetadata, StructuredMessage } from "$lib/twitch/eventsub";
import type { Badge, BasicUser, PrivmsgMessage, Range, UserNoticeMessage } from "$lib/twitch/irc";
import type { PartialUser } from "$lib/user";
import { extractEmotes } from "$lib/util";
import { Viewer } from "$lib/viewer.svelte";
import { Message } from ".";

export type Fragment =
	| { type: "text"; value: string; marked?: boolean }
	| ({ type: "mention"; marked?: boolean } & PartialUser)
	| { type: "url"; text: string; url: URL; marked?: boolean }
	| ({ type: "emote"; marked?: boolean } & Emote)
	| ({ type: "cheermote"; prefix: string; bits: number; marked?: boolean } & CheermoteTier);

const URL_RE =
	/https?:\/\/(?:www\.)?[-\w@:%.+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b[-\w()@:%+.~#?&/=]*/g;

interface TextSegment extends Range {
	type: "emote" | "cheermote" | "mention" | "url";
	data: Record<string, any>;
}

/**
 * User messages are either messages received by `PRIVMSG` commands or
 * notifications received by `USERNOTICE` commands.
 *
 * In either case, both share enough common data that they can be categorized
 * as "user" messages. The {@linkcode UserMessage.event event} property can be
 * checked to differentiate the two.
 */
export class UserMessage extends Message {
	#autoMod: AutoModMetadata | null = null;

	public constructor(public readonly data: PrivmsgMessage | UserNoticeMessage) {
		super(data);
	}

	public static from(message: StructuredMessage, sender: BasicUser) {
		const isAction = /^\x01ACTION.*$/.test(message.text);
		const text = isAction ? message.text.slice(8, -1) : message.text;

		return new UserMessage({
			type: "privmsg",
			badge_info: [],
			badges: [],
			bits: message.fragments.reduce((a, b) => {
				return a + (b.type === "cheermote" ? b.cheermote.bits : 0);
			}, 0),
			channel_id: "",
			channel_login: "",
			deleted: false,
			emotes: extractEmotes(message.fragments),
			message_id: message.message_id,
			message_text: text,
			name_color: "",
			is_action: isAction,
			is_first_msg: false,
			is_highlighted: false,
			is_mod: false,
			is_subscriber: false,
			is_recent: false,
			is_returning_chatter: false,
			reply: null,
			sender,
			server_timestamp: Date.now(),
		});
	}

	public override get id() {
		return this.data.message_id;
	}

	public override get text() {
		// message_text should only be possibly null if it's a USERNOTICE, in
		// which case we can assume system_message is present
		return this.data.message_text ?? (this.data as UserNoticeMessage).system_message;
	}

	/**
	 * Whether the current user can perform mod actions on the message.
	 *
	 * A message is considered actionable if they are a mod in the channel, the
	 * message is less than six hours old, and one of the following is true:
	 *
	 * 1. It is their own message
	 * 2. It is a message that is not sent by the broadcaster or another
	 * moderator
	 */
	public get actionable() {
		if (!app.user || !app.joined) return false;

		const now = Date.now();
		const diff = Math.abs(now - this.timestamp.getTime());

		return (
			app.user.moderating.has(app.joined.user.username) &&
			diff <= 6 * 60 * 60 * 1000 &&
			(app.user.id === this.viewer.id || !(this.viewer.isBroadcaster || this.viewer.isMod))
		);
	}

	/**
	 * The AutoMod metadata attached to the message if it was caught by AutoMod.
	 */
	public get autoMod() {
		return this.#autoMod;
	}

	/**
	 * The badges sent with the message.
	 */
	public get badges(): Badge[] {
		return this.data.badges;
	}

	/**
	 * The amount of bits sent with the message if it was a cheer.
	 */
	public get bits(): number {
		return "bits" in this.data ? (this.data.bits ?? 0) : 0;
	}

	/**
	 * Whether channel points were used to highlight the message.
	 */
	public get highlighted() {
		return "is_highlighted" in this.data && this.data.is_highlighted;
	}

	/**
	 * Whether the message is an action i.e. sent with `/me`.
	 */
	public get isAction() {
		return "is_action" in this.data && this.data.is_action;
	}

	/**
	 * Whether the message is the user's first message sent in the channel.
	 */
	public get isFirst() {
		return "is_first_msg" in this.data && this.data.is_first_msg;
	}

	/**
	 * The event associated with the message if it's a `USERNOTICE` message.
	 */
	public get event() {
		return "event" in this.data ? this.data.event : null;
	}

	/**
	 * The metadata for the parent and thread starter messages if the message
	 * is a reply.
	 */
	public get reply() {
		return "reply" in this.data ? this.data.reply : null;
	}

	public get viewer() {
		let viewer = app.joined?.viewers.get(this.data.sender.login);

		if (!viewer) {
			viewer = Viewer.from(this.data.sender, this.data.name_color);
		}

		return viewer;
	}

	public addAutoModMetadata(metadata: AutoModMetadata) {
		this.#autoMod = metadata;
		return this;
	}

	public toFragments() {
		const output: Fragment[] = [];

		const text = this.text;
		if (!text) return output;

		const chars = Array.from(text);
		const isCharMarked = Array.from<boolean>({ length: chars.length }).fill(false);

		for (const boundary of this.#autoMod?.boundaries ?? []) {
			for (let i = boundary.start_pos; i < boundary.end_pos && i < chars.length; i++) {
				isCharMarked[i] = true;
			}
		}

		const segments: TextSegment[] = [];

		if (this.bits > 0) {
			for (const cheermote of app.joined?.cheermotes ?? []) {
				const cheermoteRe = new RegExp(`\\b(${cheermote.prefix})(\\d+)\\b`, "gi");
				let match: RegExpExecArray | null;

				// eslint-disable-next-line no-cond-assign
				while ((match = cheermoteRe.exec(text))) {
					const bits = Number(match[2]);

					let selectedTier: CheermoteTier | undefined;

					for (const tier of cheermote.tiers.sort((a, b) => b.min_bits - a.min_bits)) {
						if (bits >= tier.min_bits) {
							selectedTier = tier;
							break;
						}
					}

					if (!selectedTier) continue;

					segments.push({
						type: "cheermote",
						start: match.index,
						end: match.index + match[0].length,
						data: {
							prefix: match[1],
							bits: match[2],
							tier: selectedTier,
						},
					});
				}
			}
		}

		for (const emote of this.data.emotes) {
			segments.push({
				type: "emote",
				start: emote.range.start,
				end: emote.range.end,
				data: { id: emote.id, code: emote.code },
			});
		}

		const mentionRe = /@(\w+)/g;
		let match: RegExpExecArray | null;

		// eslint-disable-next-line no-cond-assign
		while ((match = mentionRe.exec(text))) {
			segments.push({
				type: "mention",
				start: match.index,
				end: match.index + match[0].length,
				data: { token: match[0], username: match[1] },
			});
		}

		URL_RE.lastIndex = 0;

		// eslint-disable-next-line no-cond-assign
		while ((match = URL_RE.exec(text))) {
			if (!URL.canParse(match[0])) continue;

			segments.push({
				type: "url",
				start: match.index,
				end: match.index + match[0].length,
				data: { text: match[0] },
			});
		}

		segments.sort((a, b) => a.start - b.start);

		const processed: TextSegment[] = [];
		let lastEnd = -1;

		for (const segment of segments) {
			if (segment.start >= lastEnd) {
				processed.push(segment);
				lastEnd = segment.end;
			}
		}

		let currentIndex = 0;

		for (const segment of processed) {
			if (segment.start > currentIndex) {
				const chunk = chars.slice(currentIndex, segment.start).join("");
				this.#processChunk(chunk, currentIndex, isCharMarked, output);
			}

			const marked = this.#isRangeMarked(segment.start, segment.end, isCharMarked);

			if (segment.type === "cheermote") {
				output.push({
					type: "cheermote",
					prefix: segment.data.prefix,
					bits: segment.data.bits,
					marked,
					...segment.data.tier,
				});
			} else if (segment.type === "emote") {
				output.push({
					type: "emote",
					name: segment.data.code,
					url: `https://static-cdn.jtvnw.net/emoticons/v2/${segment.data.id}/default/dark/1.0`,
					width: 28,
					height: 28,
					marked,
				});
			} else if (segment.type === "mention") {
				const mention = segment.data.username;
				const viewer = app.joined?.viewers.get(mention.toLowerCase());

				output.push({
					type: "mention",
					id: viewer?.id ?? "0",
					color: viewer?.color ?? "inherit",
					username: viewer?.username ?? mention.toLowerCase(),
					displayName: viewer?.displayName ?? mention,
					marked,
				});
			} else if (segment.type === "url") {
				output.push({
					type: "url",
					text: segment.data.text,
					url: new URL(segment.data.text),
					marked,
				});
			}

			currentIndex = segment.end;
		}

		if (currentIndex < text.length) {
			const chunk = chars.slice(currentIndex).join("");
			this.#processChunk(chunk, currentIndex, isCharMarked, output);
		}

		const fragments: Fragment[] = [];
		let lastFrag: Extract<Fragment, { type: "text" }> | null = null;

		for (const frag of output) {
			if (frag.type === "text") {
				if (lastFrag && lastFrag.marked === frag.marked) {
					lastFrag.value += frag.value;
				} else {
					if (lastFrag) fragments.push(lastFrag);
					lastFrag = { ...frag };
				}
			} else {
				if (lastFrag) {
					fragments.push(lastFrag);
					lastFrag = null;
				}

				fragments.push(frag);
			}
		}

		if (lastFrag) fragments.push(lastFrag);

		return fragments;
	}

	#isRangeMarked(start: number, end: number, isCharMarked: boolean[]): boolean {
		if (start >= end) return false;
		for (let i = start; i < end; i++) {
			if (isCharMarked[i]) return true;
		}

		return false;
	}

	#processChunk(
		chunk: string,
		offset: number,
		isCharMarked: boolean[],
		fragments: Fragment[],
	): void {
		if (!chunk) return;

		let buffer: string[] = [];
		let wordStart = 0;

		const flush = (joiner = " ") => {
			if (buffer.length) {
				const text = buffer.join(joiner);

				const start = offset + wordStart;
				const end = start + Array.from(text).length;

				const marked = this.#isRangeMarked(start, end, isCharMarked);

				fragments.push({ type: "text", value: text, marked });
				buffer = [];
			}
		};

		let chunkPos = 0;

		for (const token of chunk.split(/(\s+)/)) {
			if (/\s+/.test(token)) {
				flush("");

				const start = offset + chunkPos;
				const end = start + token.length;

				const marked = this.#isRangeMarked(start, end, isCharMarked);

				fragments.push({ type: "text", value: token, marked });
			} else if (token) {
				const emote = app.joined?.emotes.get(token);

				if (emote) {
					flush();

					const start = offset + chunkPos;
					const end = start + token.length;

					const marked = this.#isRangeMarked(start, end, isCharMarked);

					fragments.push({ type: "emote", ...emote, marked });
				} else {
					if (buffer.length === 0) {
						wordStart = chunkPos;
					}

					buffer.push(token);
					flush();
				}
			}

			chunkPos += Array.from(token).length;
		}

		flush();
	}
}
