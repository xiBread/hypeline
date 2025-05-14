import { SystemMessage } from "$lib/message";
import { app } from "$lib/state.svelte";
import { defineHandler } from "../helper";

export default defineHandler({
	name: "channel.unban_request.create",
	handle(data) {
		if (!app.active) return;

		const message = new SystemMessage();

		app.active.addMessage(message.unbanRequest(data));
	},
});
