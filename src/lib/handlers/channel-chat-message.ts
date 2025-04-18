import { UserMessage } from "$lib/message";
import { app } from "$lib/state.svelte";
import { defineHandler } from ".";

export default defineHandler({
	name: "channel.chat.message",
	handle(data) {
		app.active.chat.messages.push(new UserMessage(data));
	},
});
