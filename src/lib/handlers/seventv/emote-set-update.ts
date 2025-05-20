import { invoke } from "@tauri-apps/api/core";
import { SystemMessage } from "$lib/message";
import type { UserWithColor } from "$lib/tauri";
import { Viewer } from "$lib/viewer.svelte";
import { defineHandler } from "../helper";
import type { Emote, HostFile } from "$lib/seventv";

const FORMAT_PRIORITY: Record<string, number> = {
	webp: 1,
	png: 2,
	gif: 3,
};

function reparse(emote: Emote) {
	const files = emote.data.host.files.filter((f) => f.name.startsWith("4x"));
	if (!files.length) return;

	let bestPriority: number | undefined;
	let bestFile: HostFile | undefined;

	for (const file of files) {
		const priority = FORMAT_PRIORITY[file.format.toLowerCase()];
		if (!priority) continue;

		if (bestPriority === undefined || priority < bestPriority) {
			bestPriority = priority;
			bestFile = file;
		}
	}

	if (!bestFile) return;

	return {
		id: emote.id,
		name: emote.name,
		url: `https://${emote.data.host.url}/${bestFile.name}`,
		width: bestFile.width / 4,
		height: bestFile.height / 4,
	};
}

export default defineHandler({
	name: "emote_set.update",
	async handle(data, channel) {
		if (data.id !== channel.emoteSet?.id) return;

		const twitch = data.actor.connections.find((c) => c.platform === "TWITCH");
		if (!twitch) return;

		const user = await invoke<UserWithColor | null>("get_user_from_id", { id: twitch.id });
		if (!user) return;

		const actor = Viewer.fromTwitch(user);

		const message = new SystemMessage();

		for (const change of data.pushed ?? []) {
			const emote = reparse(change.value);
			if (!emote) continue;

			message.setContext({
				type: "emoteSetUpdate",
				action: "added",
				emote,
				actor,
			});

			channel.emotes.set(emote.name, emote);
		}

		for (const change of data.pulled ?? []) {
			message.setContext({
				type: "emoteSetUpdate",
				action: "removed",
				emote: channel.emotes.get(change.old_value.name)!,
				actor,
			});

			channel.emotes.delete(change.old_value!.name);
		}

		for (const change of data.updated ?? []) {
			const old = channel.emotes.get(change.old_value.name)!;

			message.setContext({
				type: "emoteSetUpdate",
				action: "renamed",
				oldName: old.name,
				emote: old,
				actor,
			});

			old.name = change.value.name;

			channel.emotes.delete(change.old_value.name);
			channel.emotes.set(change.value.name, old);
		}

		channel.addMessage(message);
	},
});
