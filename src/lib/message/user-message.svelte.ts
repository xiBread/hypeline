import type { Emote } from "$lib/channel.svelte";
import { app } from "$lib/state.svelte";
import type { Badge, PrivmsgMessage, UserNoticeMessage } from "$lib/twitch/irc";
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
	/https?:\/\/(?:www\.)?[-\w@:%.+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b[-\w()@:%+.~#?&/=]*/;

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
		let buffer: string[] = [];

		function flush() {
			if (buffer.length) {
				fragments.push({ type: "text", value: buffer.join(" ") });
				buffer = [];
			}
		}

		for (const token of this.data.message_text.split(/\s+/)) {
			const emote = app.active.emotes.get(token);

			if (emote) {
				flush();
				fragments.push({ type: "emote", ...emote });
			} else if (token.startsWith("@")) {
				const mention = token.slice(1);
				const viewer = app.active.viewers.get(mention.toLowerCase());

				flush();

				// Even if the viewer isn't found, still create a mention
				// fragment so it gets styled properly
				fragments.push({
					type: "mention",
					id: viewer?.id ?? "0",
					color: viewer?.color ?? "inherit",
					username: viewer?.username ?? mention.toLowerCase(),
					displayName: viewer?.displayName ?? mention,
				});
			} else if (URL_RE.test(token)) {
				// todo: better detection/parsing
				flush();
				fragments.push({
					type: "url",
					text: token,
					url: new URL(token),
				});
			} else {
				buffer.push(token);
			}
		}

		flush();
		return fragments;
	}
}
