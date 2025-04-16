import type { Emote } from "$lib/channel.svelte";
import { app } from "$lib/state.svelte";
import type { Badge } from "$lib/twitch/api";
import type { BaseMessage as BaseMessageData } from "$lib/twitch/eventsub";
import { BaseMessage } from "./message";

export type Fragment =
	| { type: "text"; value: string }
	| { type: "mention"; id: string; username: string }
	| { type: "url"; text: string; url: URL }
	| ({ type: "emote" } & Emote)
	// todo: cheermotes
	| { type: "cheermote"; value: string };

export interface MessageUser {
	id: string;
	name: string;
	color: string;
}

const URL_RE =
	/https?:\/\/(?:www\.)?[-\w@:%.+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b[-\w()@:%+.~#?&/=]*/;

export class TextMessage extends BaseMessage {
	public readonly fragments: Fragment[];

	public constructor(public readonly data: BaseMessageData) {
		super(data);

		this.fragments = this.#transformFragments();
	}

	public get badges(): Badge[] {
		const badges: Badge[] = [];

		if (!this.data.badges.length) {
			return badges;
		}

		for (const badge of this.data.badges) {
			const chatBadge = app.active.badges.get(badge.set_id)?.[badge.id];

			if (chatBadge) {
				badges.push(chatBadge);
			}
		}

		return badges;
	}

	public get user(): MessageUser {
		return {
			id: this.data.chatter_user_id,
			name: this.data.chatter_user_name,
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
						username: fragment.mention.user_name,
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
