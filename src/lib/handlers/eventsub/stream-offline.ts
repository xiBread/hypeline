import { SystemMessage } from "$lib/message";
import { Viewer } from "$lib/viewer.svelte";
import { defineHandler } from "../helper";

export default defineHandler({
	name: "stream.offline",
	handle(data, channel) {
		const message = new SystemMessage();

		channel.setStream(null);
		channel.addMessage(
			message.setContext({
				type: "streamStatus",
				online: false,
				broadcaster: Viewer.fromBroadcaster(data),
			}),
		);
	},
});
