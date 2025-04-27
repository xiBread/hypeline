import type { Emote } from "$lib/channel.svelte";
import { app } from "$lib/state.svelte";
import type {
	Badge,
	PrivmsgMessage,
	Range,
	UserNoticeMessage,
} from "$lib/twitch/irc";
import type { PartialUser } from "$lib/user";
import { Viewer } from "$lib/viewer.svelte";
import { Message } from "./";

export type Fragment =
	| { type: "text"; value: string }
	| ({ type: "mention" } & PartialUser)
	| { type: "url"; text: string; url: URL }
	| ({ type: "emote" } & Emote)
	// todo: cheermotes
	| { type: "cheermote"; value: string };

const URL_RE =
	/https?:\/\/(?:www\.)?[-\w@:%.+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b[-\w()@:%+.~#?&/=]*/g;

interface TextSegment extends Range {
	type: "emote" | "mention" | "url";
	data: Record<string, string>;
}

/**
 * User messages are either messages received by `PRIVMSG` commands or
 * notifications received by `USERNOTICE` commands.
 *
 * In either case, both share enough common data that they can be categorized
 * as "user" messages. Properties such as {@linkcode announcement} can be
 * checked to differentiate the two.
 */
export class UserMessage extends Message {
	#deleted = $state(false);

	public readonly fragments: Fragment[];

	public constructor(
		public readonly data: PrivmsgMessage | UserNoticeMessage,
	) {
		super(data);

		this.#deleted = data.deleted;
		this.fragments = this.#fragment();
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
		if (!app.user) return false;

		const now = Date.now();
		const diff = Math.abs(now - this.timestamp.getTime());

		// prettier-ignore
		return (
			app.user.moderating.has(app.active.user.id) &&
			diff <= 6 * 60 * 60 * 1000 &&
			(
				app.user.id === this.viewer.id ||
				!(this.viewer.broadcaster || this.viewer.moderator)
			)
		);
	}

	/**
	 * Whether the message has been deleted.
	 */
	public get deleted() {
		return this.#deleted;
	}

	/**
	 * The badges sent with the message.
	 */
	public get badges(): Badge[] {
		return this.data.badges;
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
		return "is_action" in this.data ? this.data.is_action : false;
	}

	/**
	 * Whether the message was retreived by the `recent-messages` API.
	 */
	public get isRecent() {
		return this.data.is_recent;
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
		let viewer = app.active.viewers.get(this.data.sender.name);

		if (!viewer) {
			viewer = new Viewer({
				id: this.data.sender.id,
				username: this.data.sender.login,
				displayName: this.data.sender.name,
				color: this.data.name_color || "inherit",
			});
		}

		return viewer;
	}

	public setDeleted() {
		this.#deleted = true;
	}

	#fragment() {
		const fragments: Fragment[] = [];
		const message = this.text;

		const chars = Array.from(message);

		const segments: TextSegment[] = [];

		for (const emote of this.data.emotes) {
			segments.push({
				start: emote.range.start,
				end: emote.range.end,
				type: "emote",
				data: { id: emote.id, code: emote.code },
			});
		}

		const mentionRe = /@(\w+)/g;
		let match: RegExpExecArray | null;

		// eslint-disable-next-line no-cond-assign
		while ((match = mentionRe.exec(message))) {
			segments.push({
				start: match.index,
				end: match.index + match[0].length,
				type: "mention",
				data: { token: match[0], username: match[1] },
			});
		}

		URL_RE.lastIndex = 0;

		// eslint-disable-next-line no-cond-assign
		while ((match = URL_RE.exec(message))) {
			if (!URL.canParse(match[0])) continue;

			segments.push({
				start: match.index,
				end: match.index + match[0].length,
				type: "url",
				data: { text: match[0] },
			});
		}

		segments.sort((a, b) => a.start - b.start);

		const processed = [];
		let lastEnd = -1;

		for (const segment of segments) {
			if (segment.start >= lastEnd) {
				processed.push(segment);
				lastEnd = segment.end;
			}
		}

		let currentIndex = 0;

		function processChunk(chunk: string) {
			if (!chunk) return;

			let buffer: string[] = [];

			function flush() {
				if (buffer.length) {
					fragments.push({ type: "text", value: buffer.join(" ") });
					buffer = [];
				}
			}

			for (const token of chunk.split(/\s+/)) {
				const emote = app.active.emotes.get(token);

				if (emote) {
					flush();
					fragments.push({ type: "emote", ...emote });
				} else {
					buffer.push(token);
				}
			}

			flush();
		}

		for (const segment of processed) {
			if (segment.start > currentIndex) {
				const text = chars.slice(currentIndex, segment.start).join("");

				processChunk(text);
			}

			if (segment.type === "emote") {
				fragments.push({
					type: "emote",
					name: segment.data.code,
					height: 28,
					width: 28,
					url: `https://static-cdn.jtvnw.net/emoticons/v2/${segment.data.id}/default/dark/3.0`,
				});
			} else if (segment.type === "mention") {
				const mention = segment.data.username;
				const viewer = app.active.viewers.get(mention.toLowerCase());

				fragments.push({
					type: "mention",
					id: viewer?.id ?? "0",
					color: viewer?.color ?? "inherit",
					username: viewer?.username ?? mention.toLowerCase(),
					displayName: viewer?.displayName ?? mention,
				});
			} else if (segment.type === "url") {
				fragments.push({
					type: "url",
					text: segment.data.text,
					url: new URL(segment.data.text),
				});
			}

			currentIndex = segment.end;
		}

		if (currentIndex < chars.length) {
			processChunk(chars.slice(currentIndex).join(""));
		}

		const final: Fragment[] = [];
		let previous: Fragment | null = null;

		for (const frag of fragments) {
			if (frag.type === "text" && previous?.type === "text") {
				previous.value += frag.value;
			} else {
				final.push(frag);
				previous = frag;
			}
		}

		return final;
	}
}
