import type { Emote } from "$lib/channel.svelte";
import { app } from "$lib/state.svelte";
import type * as Twitch from "$lib/twitch/eventsub";
import { Viewer } from "$lib/viewer.svelte";
import { Message } from "./";

export type Fragment =
	| { type: "text"; value: string }
	| { type: "mention"; id: string; displayName: string }
	| { type: "url"; text: string; url: URL }
	| ({ type: "emote" } & Emote)
	// todo: cheermotes
	| { type: "cheermote"; value: string };

const URL_RE =
	/https?:\/\/(?:www\.)?[-\w@:%.+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b[-\w()@:%+.~#?&/=]*/;

/**
 * User messages are either messages received by `channel.chat.message` events
 * or notifications received by `channel.chat.notification` events.
 *
 * In either case, both share enough common data that they can be categorized
 * as "user" messages. Properties such as {@linkcode announcement} can be
 * checked to differentiate the two.
 */
export class UserMessage extends Message {
	#deleted = $state(false);

	public readonly fragments: Fragment[];

	public constructor(
		public readonly data:
			| Twitch.ChannelChatMessage
			| Twitch.ChannelChatNotification,
	) {
		super(data);

		this.fragments = this.#transformFragments();
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
	 * The {@link Twitch.AnnouncementNotification announcement} associated with
	 * the message if it's an `announcement` notification.
	 */
	public get announcement() {
		return this.noticeType === "announcement"
			? (this.data as Twitch.AnnouncementNotification).announcement
			: null;
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
	public get badges(): Twitch.Badge[] {
		return this.data.badges;
	}

	/**
	 * Whether channel points were used to highlight the message.
	 */
	public get highlighted() {
		return this.type === "channel_points_highlighted";
	}

	/**
	 * Whether the message is an action i.e. sent with `/me`.
	 */
	public get isAction() {
		return /^\x01ACTION .+\x01$/.test(this.data.message.text);
	}

	/**
	 * The type of notification if the message is a notification.
	 */
	public get noticeType() {
		return "notice_type" in this.data ? this.data.notice_type : null;
	}

	/**
	 * The {@link Twitch.ResubNotification resub} associated with the message
	 * if it's a `resub` notification.
	 */
	public get resub() {
		return this.noticeType === "resub"
			? (this.data as Twitch.ResubNotification).resub
			: null;
	}

	/**
	 * The metadata for the parent and thread starter messages if the message
	 * is a reply.
	 */
	public get reply() {
		return "reply" in this.data && this.data.reply ? this.data.reply : null;
	}

	public get type() {
		return "message_type" in this.data
			? this.data.message_type
			: "notification";
	}

	public get viewer() {
		let viewer = app.active.viewers.get(this.data.chatter_user_id);

		if (!viewer) {
			viewer = new Viewer({
				id: this.data.chatter_user_id,
				displayName: this.data.chatter_user_name,
				color: this.data.color,
			});
		}

		return viewer;
	}

	public setDeleted() {
		this.#deleted = true;
	}

	#transformFragments() {
		const transformed: Fragment[] = [];
		let buffer: string[] = [];

		function flush() {
			if (buffer.length) {
				transformed.push({ type: "text", value: buffer.join(" ") });
				buffer = [];
			}
		}

		for (const fragment of this.data.message.fragments) {
			switch (fragment.type) {
				case "text": {
					const tokens = fragment.text.split(/\s+/);

					for (const token of tokens) {
						const emote = app.active.emotes.get(token);

						if (emote) {
							flush();
							transformed.push({ type: "emote", ...emote });
						} else if (URL_RE.test(token)) {
							// todo: better detection/parsing
							flush();
							transformed.push({
								type: "url",
								text: token,
								url: new URL(token),
							});
						} else {
							buffer.push(token);
						}
					}

					break;
				}

				case "mention": {
					flush();
					transformed.push({
						type: "mention",
						id: fragment.mention.user_id,
						displayName: fragment.mention.user_name,
					});

					break;
				}

				case "emote": {
					flush();

					const format = fragment.emote.format.includes("animated")
						? "animated"
						: "static";

					transformed.push({
						type: "emote",
						name: fragment.text,
						url: `https://static-cdn.jtvnw.net/emoticons/v2/${fragment.emote.id}/${format}/dark/3.0`,
						width: 28,
						height: 28,
					});

					break;
				}

				// temporary
				case "cheermote": {
					buffer.push(fragment.text);
					flush();

					break;
				}
			}
		}

		flush();
		return transformed;
	}
}
