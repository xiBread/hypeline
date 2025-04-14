import { UserMessage } from "$lib/message";
import { chat } from "$lib/state.svelte";
import { defineHandler } from ".";

export default defineHandler({
	name: "channel.chat.message",
	handle(data) {
		chat.messages.push(new UserMessage(data));
	},
});
