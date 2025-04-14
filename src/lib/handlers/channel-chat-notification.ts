import { NotificationMessage } from "$lib/message";
import { chat } from "$lib/state.svelte";
import { defineHandler } from ".";

export default defineHandler({
	name: "channel.chat.notification",
	handle(data) {
		chat.messages.push(new NotificationMessage(data));
	},
});
