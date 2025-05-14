import { SystemMessage } from "$lib/message";
import type { UserMessage } from "$lib/message";
import { app } from "$lib/state.svelte";
import { defineHandler } from "../helper";

export default defineHandler({
	name: "clearmsg",
	handle(data) {
		if (!app.active) return;

		const message = app.active.messages.find(
			(m): m is UserMessage => m.isUser() && m.id === data.message_id,
		);
		if (!message) return;

		message.setDeleted();

		if (data.is_recent || (!data.is_recent && !app.user?.moderating.has(data.channel_login))) {
			const sysmsg = new SystemMessage(data);

			app.active.addMessage(sysmsg.delete(data.message_text, message.viewer));
		}
	},
});
