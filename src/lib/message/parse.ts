import { parse as parseTld } from "tldts";
import { app } from "$lib/state.svelte";
import type { Emote } from "$lib/tauri";
import type { CheermoteTier } from "$lib/twitch/api";
import type { User } from "$lib/user.svelte";
import { find } from "$lib/util";
import type { UserMessage } from "./user-message";

interface BaseNode {
	start: number;
	end: number;
	value: string;
	marked: boolean;
}

interface TextNode extends BaseNode {
	type: "text";
	data: string;
}

interface LinkNode extends BaseNode {
	type: "link";
	data: {
		url: URL;
	};
}

interface MentionNode extends BaseNode {
	type: "mention";
	data: {
		user: User | undefined;
	};
}

interface CheerNode extends BaseNode {
	type: "cheer";
	data: {
		prefix: string;
		bits: number;
		tier: CheermoteTier;
	};
}

interface EmoteNode extends BaseNode {
	type: "emote";
	data: {
		layers: Emote[];
		emote: Emote;
	};
}

export type Node = TextNode | LinkNode | MentionNode | CheerNode | EmoteNode;

export function parse(message: UserMessage): Node[] {
	const nodes: Node[] = [];

	const parts = message.text.split(/\s+/);
	let prevNode: Node | undefined;

	for (let i = 0; i < parts.length; i++) {
		const part = parts[i];
		const start = message.text.indexOf(part, i === 0 ? 0 : (prevNode?.end ?? 0));

		const base: BaseNode = {
			start,
			end: start + part.length,
			value: part,
			marked: false,
		};

		const url = URL.parse(`https://${part.replace(/^https?:\/\/|\.$/i, "")}`);
		const result = url ? parseTld(url.hostname) : null;

		const cheermote = app.joined?.cheermotes.find((c) =>
			part.toLowerCase().startsWith(c.prefix.toLowerCase()),
		);
		const ircEmote = message.data.emotes.find((e) => e.code === part);
		const emote = app.joined?.emotes.get(part);

		if (url && result?.domain && result.isIcann) {
			nodes.push({
				...base,
				type: "link",
				data: { url },
			});
		} else if (/^@\w{4,24}$/.test(part)) {
			const name = part.slice(1).toLowerCase();
			const user = find(app.joined?.viewers ?? [], (u) => u.username === name);

			nodes.push({
				...base,
				type: "mention",
				data: { user },
			});
		} else if (cheermote) {
			const amount = Number(part.slice(cheermote.prefix.length));

			if (amount > 0) {
				let selectedTier: CheermoteTier | undefined;

				for (const tier of cheermote.tiers.sort((a, b) => b.min_bits - a.min_bits)) {
					if (amount >= tier.min_bits) {
						selectedTier = tier;
						break;
					}
				}

				if (selectedTier) {
					nodes.push({
						...base,
						type: "cheer",
						data: {
							prefix: cheermote.prefix,
							bits: amount,
							tier: selectedTier,
						},
					});
				}
			}
		} else if (ircEmote) {
			const baseUrl = "https://static-cdn.jtvnw.net/emoticons/v2";

			nodes.push({
				start: ircEmote.range.start,
				end: ircEmote.range.end,
				value: ircEmote.code,
				marked: false,
				type: "emote",
				data: {
					emote: {
						name: ircEmote.code,
						width: 56,
						height: 56,
						srcset: [1, 2, 3].map((density) => {
							return `${baseUrl}/${ircEmote.id}/default/dark/${density}.0 ${density}x`;
						}),
						zero_width: false,
					},
					layers: [],
				},
			});
		} else if (emote) {
			if (emote.zero_width && prevNode?.type === "emote") {
				prevNode.data.layers.push(emote);
			} else {
				nodes.push({
					...base,
					type: "emote",
					data: {
						emote,
						layers: [],
					},
				});
			}
		} else {
			nodes.push({
				...base,
				type: "text",
				data: part,
			});
		}

		prevNode = nodes.at(-1);
	}

	return mergeTextNodes(nodes);
}

function mergeTextNodes(nodes: Node[]): Node[] {
	if (nodes.length < 2) return nodes;

	const merged: Node[] = [];

	for (const node of nodes) {
		const prevNode = merged.at(-1);

		if (prevNode?.type === "text" && node.type === "text") {
			prevNode.end = node.end;
			prevNode.value += ` ${node.value}`;
			prevNode.data += ` ${node.data}`;
			prevNode.marked ||= node.marked;
		} else {
			merged.push(node);
		}
	}

	return merged;
}
