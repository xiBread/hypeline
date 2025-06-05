import { SystemMessage } from "$lib/message";
import { app } from "$lib/state.svelte";
import { User } from "$lib/user.svelte";
import { defineHandler } from "../helper";

export default defineHandler({
	name: "clearchat",
	async handle(data, channel) {
		// Return early if the message isn't recent and the user is a moderator
		// in the channel to prevent showing two different messages.
		if (!data.is_recent && app.user?.moderating.has(data.channel_id)) {
			return;
		}

		const message = new SystemMessage(data);

		if (data.action.type === "clear") {
			channel.clearMessages();
			channel.addMessage(message.setContext({ type: "clear" }));
			return;
		}

		const target = await User.from(data.action.user_id);

		channel.clearMessages(target.id);

		if (data.action.type === "ban") {
			message.setContext({
				type: "banStatus",
				banned: true,
				reason: null,
				user: target,
			});
		} else {
			message.setContext({
				type: "timeout",
				seconds: data.action.duration.secs,
				reason: null,
				user: target,
			});
		}

		channel.addMessage(message);
	},
});
