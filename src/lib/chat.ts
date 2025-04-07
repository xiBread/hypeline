import { invoke } from "@tauri-apps/api/core";
import { app, chat } from "./state.svelte";
import type { Badge, BadgeSet, ChannelChatMessage } from "./twitch-api";

export interface Chat {
	channel_id: string;
	emotes: Record<string, Emote>;
	badges: BadgeSet[];
}

export interface Emote {
	name: string;
	url: string;
	width: number;
	height: number;
}

export type Fragment =
	| { type: "mention"; value: string }
	| { type: "text"; value: string }
	| { type: "url"; text: string; url: URL }
	| ({ type: "emote" } & Emote);

const URL_RE =
	/https?:\/\/(?:www\.)?[-\w@:%.+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b[-\w()@:%+.~#?&/=]*/;

export async function join(channel: string) {
	const data = await invoke<{
		channel_id: string;
		emotes: Record<string, Emote>;
		badges: BadgeSet[];
	}>("join_chat", { sessionId: app.wsSessionId, channel });

	chat.channelId = data.channel_id;

	for (const set of data.badges) {
		const badges = set.versions.reduce<Record<string, Badge>>(
			(acc, ver) => ({ ...acc, [ver.id]: ver }),
			{},
		);

		chat.badges.set(set.set_id, badges);
	}

	for (const [name, emote] of Object.entries(data.emotes)) {
		chat.emotes.set(name, emote);
	}
}

export function reinterpretFragments(
	original: ChannelChatMessage["message"]["fragments"],
): Fragment[] {
	const fragments: Fragment[] = [];

	for (const f of original) {
		if (f.type === "text") {
			const urlMatch = URL_RE.exec(f.text);

			if (urlMatch) {
				const [url] = urlMatch;
				const [before, after] = f.text.split(url);

				if (before) {
					fragments.push({ type: "text", value: before });
				}

				fragments.push({
					type: "url",
					text: url,
					url: new URL(url),
				});

				if (after) {
					fragments.push({ type: "text", value: after });
				}
			} else if (chat.emotes.has(f.text)) {
				fragments.push({
					type: "emote",
					...chat.emotes.get(f.text)!,
				});
			} else {
				fragments.push({
					type: "text",
					value: f.text,
				});
			}
		} else if (f.type === "emote") {
			const format = f.emote.format.includes("animated")
				? "animated"
				: "static";

			fragments.push({
				type: "emote",
				name: f.text,
				url: `https://static-cdn.jtvnw.net/emoticons/v2/${f.emote.id}/${format}/dark/3.0`,
				width: 28,
				height: 28,
			});
		} else if (f.type === "mention") {
			fragments.push({
				type: "mention",
				value: f.text,
			});
		} else {
			// todo: cheermotes
		}
	}

	return fragments;
}
