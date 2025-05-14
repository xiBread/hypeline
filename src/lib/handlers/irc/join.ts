import { SystemMessage } from "$lib/message";
import { defineHandler } from "../helper";

export default defineHandler({
	name: "join",
	handle(data, channel) {
		const user = channel.viewers.get(data.channel_login);
		if (!user) return;

		channel.messages.push(SystemMessage.joined(user));
	},
});
