import { UserMessage } from "$lib/message";
import { defineHandler } from "../helper";

export default defineHandler({
	name: "channel.chat.user_message_hold",
	handle(data, channel) {
		data.message.message_id = data.message_id;

		const message = UserMessage.from(data.message, {
			id: data.user_id,
			login: data.user_login,
			name: data.user_name,
		});

		message.addAutoModMetadata({
			category: "msg_hold",
			level: Number.NaN,
			boundaries: [],
		});

		channel.addMessage(message);
	},
});
