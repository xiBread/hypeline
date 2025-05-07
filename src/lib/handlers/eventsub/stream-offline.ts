import { SystemMessage } from "$lib/message";
import { app } from "$lib/state.svelte";
import { Viewer } from "$lib/viewer.svelte";
import { defineHandler } from "../helper";

export default defineHandler({
	name: "stream.offline",
	handle(data) {
		const message = new SystemMessage();
		const broadcaster = Viewer.fromBroadcaster(data);

		app.active.addMessage(message.streamStatus(false, broadcaster));
	},
});
