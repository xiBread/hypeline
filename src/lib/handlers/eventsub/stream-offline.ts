import { SystemMessage } from "$lib/message";
import { Viewer } from "$lib/viewer.svelte";
import { defineHandler } from "../helper";

export default defineHandler({
	name: "stream.offline",
	handle(data, channel) {
		const message = new SystemMessage();
		const broadcaster = Viewer.fromBroadcaster(data);

		channel.addMessage(message.streamStatus(false, broadcaster));
	},
});
