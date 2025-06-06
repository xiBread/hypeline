import { SystemMessage } from "$lib/message";
import { User } from "$lib/user.svelte";
import { defineHandler } from "../helper";

export default defineHandler({
	name: "channel.unban_request.create",
	handle(data, channel) {
		const message = new SystemMessage();

		channel.addMessage(
			message.setContext({
				type: "unbanRequest",
				request: data,
				user: User.fromBasic(data),
			}),
		);
	},
});
