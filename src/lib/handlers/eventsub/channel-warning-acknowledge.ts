import { SystemMessage } from "$lib/message";
import { User } from "$lib/user.svelte";
import { defineHandler } from "../helper";

export default defineHandler({
	name: "channel.warning.acknowledge",
	handle(data, channel) {
		const message = new SystemMessage();

		channel.addMessage(
			message.setContext({
				type: "warnAck",
				user: User.fromBasic(data),
			}),
		);
	},
});
