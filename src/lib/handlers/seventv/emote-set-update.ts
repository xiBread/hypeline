import { invoke } from "@tauri-apps/api/core";
import { SystemMessage } from "$lib/message";
import type { Emote } from "$lib/seventv";
import type { UserWithColor } from "$lib/tauri";
import { Viewer } from "$lib/viewer.svelte";
import { defineHandler } from "../helper";

function reparse(emote: Emote) {
	let width = 28;
	let height = 28;
	const srcset: string[] = [];

	for (const format of ["webp", "png", "gif"]) {
		const matchedFiles = emote.data.host.files.filter(
			(file) => file.format.toLowerCase() === format,
		);

		if (matchedFiles.length) {
			matchedFiles.sort((a, b) => a.width - b.width);

			for (const file of matchedFiles) {
				width = file.width;
				height = file.height;

				srcset.push(`https:${emote.data.host.url}/${file.name} ${file.name[0]}x`);
			}

			break;
		}
	}

	return {
		id: emote.id,
		name: emote.name,
		width: width / 2,
		height: height / 2,
		srcset,
		zero_width: (emote.data.flags & 256) === 256,
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
