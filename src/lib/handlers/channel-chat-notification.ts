import { NotificationMessage } from "$lib/message";
import { app } from "$lib/state.svelte";
import { defineHandler } from ".";

export default defineHandler({
	name: "channel.chat.notification",
	handle(data) {
		app.active.chat.messages.push(new NotificationMessage(data));
	},
});
