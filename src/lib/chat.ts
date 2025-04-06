import { invoke } from "@tauri-apps/api/core";
import Database from "@tauri-apps/plugin-sql";
import { appState } from "./app-state.svelte";

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
	/^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/;

export function extractFragments(content: string, emotes: Map<string, Emote>) {
	const fragments: Fragment[] = [];
	let buffer = "";

	for (const part of content.split(/\s+/)) {
		if (part.startsWith("@")) {
			if (buffer) {
				fragments.push({ type: "text", value: buffer.trim() });
				buffer = "";
			}

			fragments.push({ type: "mention", value: part });
		} else if (URL_RE.test(part)) {
			if (buffer) {
				fragments.push({ type: "text", value: buffer.trim() });
				buffer = "";
			}

			fragments.push({ type: "url", text: part, url: new URL(part) });
		} else if (emotes.has(part)) {
			if (buffer) {
				fragments.push({ type: "text", value: buffer.trim() });
				buffer = "";
			}

			fragments.push({ type: "emote", ...emotes.get(part)! });
		} else {
			buffer += part + " ";
		}
	}

	if (buffer) {
		fragments.push({ type: "text", value: buffer.trim() });
	}

	return fragments;
}
