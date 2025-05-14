import { SystemMessage } from "$lib/message";
import { defineHandler } from "../helper";

export default defineHandler({
	name: "channel.unban_request.create",
	handle(data, channel) {
		const message = new SystemMessage();

		channel.addMessage(message.unbanRequest(data));
	},
});
