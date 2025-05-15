import { SystemMessage } from "$lib/message";
import { Viewer } from "$lib/viewer.svelte";
import { defineHandler } from "../helper";

export default defineHandler({
	name: "stream.online",
	handle(data, channel) {
		const message = new SystemMessage();

		channel.addMessage(
			message.setContext({
				type: "streamStatus",
				online: true,
				broadcaster: Viewer.fromBroadcaster(data),
			}),
		);
	},
});
