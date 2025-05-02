import { SystemMessage } from "$lib/message";
import { app } from "$lib/state.svelte";
import { defineHandler } from "../helper";

export default defineHandler({
	name: "join",
	handle(data) {
		const user = app.active.viewers.get(data.channel_login);
		if (!user) return;

		app.active.messages.push(SystemMessage.joined(user));
	},
});
