import { app } from "$lib/state.svelte";
import type { AutoModMetadata, StructuredMessage } from "$lib/twitch/eventsub";
import type { Badge, BasicUser, PrivmsgMessage, UserNoticeMessage } from "$lib/twitch/irc";
import { User } from "$lib/user.svelte";
import { extractEmotes } from "$lib/util";
import { Message, parse } from "./";
import type { Node } from "./";

/**
 * User messages are either messages received by `PRIVMSG` commands or
 * notifications received by `USERNOTICE` commands.
 */
export class UserMessage extends Message {
	#author: User;
	#autoMod: AutoModMetadata | null = null;

	public readonly nodes: Node[];

	public constructor(public readonly data: PrivmsgMessage | UserNoticeMessage) {
		super(data);

		let user = app.joined?.viewers.get(this.data.sender.id);

		if (!user) {
			user = User.fromBare(this.data.sender, this.data.name_color);
		}

		this.#author = user;
		this.nodes = parse(this).sort((a, b) => a.start - b.start);
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
			app.user.moderating.has(app.joined.user.id) &&
			diff <= 6 * 60 * 60 * 1000 &&
			(app.user.id === this.author.id || !this.author.isMod)
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

	/**
	 * The user who sent the message.
	 */
	public get author() {
		return this.#author;
	}

	public addAutoModMetadata(metadata: AutoModMetadata) {
		this.#autoMod = metadata;
		return this;
	}
}
