import { invoke } from "@tauri-apps/api/core";
import Database from "@tauri-apps/plugin-sql";
import { appState } from "./app-state.svelte";
import type { Fragment as ApiFragment } from "./twitch-api";

let emotes: Database | undefined;

export interface Emote {
	name: string;
	url: string;
	width: number;
	height: number;
}

export async function joinChat(
	channel: string,
): Promise<{ id: string; emotes: Map<string, Emote> }> {
	const id = await invoke<string>("join_chat", {
		sessionId: appState.wsSessionId,
		channel,
	});

	if (!emotes) {
		emotes = await Database.load("sqlite:emotes.db");
	}

	const rows = await emotes.select<Emote[]>(
		"SELECT name, url, width, height FROM emotes WHERE username = $1",
		[channel],
	);

	const channelEmotes = new Map<string, Emote>();

	for (const emote of rows) {
		channelEmotes.set(emote.name, emote);
	}

	return { id, emotes: channelEmotes };
}

export type Fragment =
	| { type: "mention"; value: string }
	| { type: "text"; value: string }
	| { type: "url"; text: string; url: URL }
	| ({ type: "emote" } & Emote);

const URL_RE =
	/https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)/;

export function reinterpretFragments(
	original: ApiFragment[],
	emotes: Map<string, Emote>,
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
			} else if (emotes.has(f.text)) {
				fragments.push({
					type: "emote",
					...emotes.get(f.text)!,
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
