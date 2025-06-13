import { SystemMessage } from "$lib/message";
import { User } from "$lib/user.svelte";
import { defineHandler } from "../helper";

export default defineHandler({
	name: "automod.message.update",
	handle(data, channel) {
		const sysmsg = new SystemMessage();

		const message = channel.messages.find((m) => m.id === data.message_id);
		message?.setDeleted();

		channel.addMessage(
			sysmsg.setContext({
				type: "autoMod",
				status: data.status,
				user: User.fromBasic(data),
				moderator: User.fromModerator(data),
			}),
		);
	},
});
