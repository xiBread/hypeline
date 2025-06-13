import { SystemMessage } from "$lib/message";
import { defineHandler } from "../helper";

export default defineHandler({
	name: "channel.chat.user_message_update",
	handle(data, channel) {
		if (data.status === "invalid") return;

		const message = channel.messages.find((m) => m.id === data.message_id);
		message?.setDeleted();

		const sysmsg = new SystemMessage();
		sysmsg.setText(`A moderator ${data.status} your message.`);

		channel.addMessage(sysmsg);
	},
});
