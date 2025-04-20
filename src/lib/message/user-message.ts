import type { Emote } from "$lib/channel.svelte";
import { app } from "$lib/state.svelte";
import type * as Twitch from "$lib/twitch/eventsub";
import { BaseMessage } from "./message";

export type Fragment =
	| { type: "text"; value: string }
	| { type: "mention"; id: string; displayName: string }
	| { type: "url"; text: string; url: URL }
	| ({ type: "emote" } & Emote)
	// todo: cheermotes
	| { type: "cheermote"; value: string };

const URL_RE =
	/https?:\/\/(?:www\.)?[-\w@:%.+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b[-\w()@:%+.~#?&/=]*/;

export class UserMessage extends BaseMessage {
	public readonly fragments: Fragment[];

	public constructor(
		public readonly data:
			| Twitch.ChannelChatMessage
			| Twitch.ChannelChatNotification,
	) {
		super(data);

		this.fragments = this.#transformFragments();
	}

	public get announcement() {
		return this.noticeType === "announcement"
			? (this.data as Twitch.AnnouncementNotification).announcement
			: null;
	}

	public get badges(): Twitch.Badge[] {
		return this.data.badges;
	}

	public get highlighted() {
		return this.type === "channel_points_highlighted";
	}

	public get isAction() {
		return /^\x01ACTION .+\x01$/.test(this.data.message.text);
	}

	public get noticeType() {
		return "notice_type" in this.data ? this.data.notice_type : null;
	}

	public get resub() {
		return this.noticeType === "resub"
			? (this.data as Twitch.ResubNotification).resub
			: null;
	}

	public get reply() {
		return "reply" in this.data && this.data.reply ? this.data.reply : null;
	}

	public get text() {
		return this.data.message.text;
	}

	public get type() {
		return "message_type" in this.data
			? this.data.message_type
			: "notification";
	}

	public get user() {
		return {
			id: this.data.chatter_user_id,
			displayName: this.data.chatter_user_name,
			color: this.data.color,
		};
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
