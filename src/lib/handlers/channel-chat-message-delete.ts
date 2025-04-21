import type { UserMessage } from "$lib/message";
import { app } from "$lib/state.svelte";
import { defineHandler } from "./helper";

export default defineHandler({
	name: "channel.chat.message_delete",
	handle(data) {
		const message = app.active.messages.find(
			(m): m is UserMessage => m.isUser() && m.id === data.message_id,
		);
		if (!message) return;

		message.setDeleted();
	},
});
