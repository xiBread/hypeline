import { invoke } from "@tauri-apps/api/core";
import { SystemMessage } from "$lib/message";
import type { Stream } from "$lib/twitch/api";
import { Viewer } from "$lib/viewer.svelte";
import { defineHandler } from "../helper";

export default defineHandler({
	name: "stream.online",
	async handle(data, channel) {
		const message = new SystemMessage();

		const stream = await invoke<Stream | null>("get_stream", { id: data.broadcaster_user_id });
		channel.setStream(stream);

		channel.addMessage(
			message.setContext({
				type: "streamStatus",
				online: true,
				broadcaster: Viewer.fromBroadcaster(data),
			}),
		);
	},
});
