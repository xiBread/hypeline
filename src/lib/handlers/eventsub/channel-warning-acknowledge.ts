import { SystemMessage } from "$lib/message";
import { app } from "$lib/state.svelte";
import { Viewer } from "$lib/viewer.svelte";
import { defineHandler } from "../helper";

export default defineHandler({
	name: "channel.warning.acknowledge",
	handle(data) {
		if (!app.active) return;

		const message = new SystemMessage();
		const viewer = Viewer.fromBasic(data);

		app.active.addMessage(message.warnAck(viewer));
	},
});
