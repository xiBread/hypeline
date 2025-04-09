import type { Fragment } from "$lib/chat";
import { chat } from "$lib/state.svelte";
import { ChannelChatMessage } from "$lib/twitch-api";
import { defineHandler } from ".";

export default defineHandler({
	name: "channel.chat.message",
	schema: ChannelChatMessage,
	handle(data) {
		chat.messages.push({
			...data,
			type: "user",
			fragments: transformFragments(data.message.fragments),
		});
	},
});

const URL_RE =
	/https?:\/\/(?:www\.)?[-\w@:%.+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b[-\w()@:%+.~#?&/=]*/;

export function transformFragments(
	fragments: ChannelChatMessage["message"]["fragments"],
): Fragment[] {
	const transformed: Fragment[] = [];
	let buffer: string[] = [];

	function flush() {
		if (buffer.length) {
			transformed.push({ type: "text", value: buffer.join(" ") });
			buffer = [];
		}
	}

	for (const fragment of fragments) {
		switch (fragment.type) {
			case "text": {
				const tokens = fragment.text.split(/\s+/);

				for (const token of tokens) {
					const emote = chat.emotes.get(token);

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
				transformed.push({ type: "mention", value: fragment.text });

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
