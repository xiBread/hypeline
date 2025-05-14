import { SystemMessage } from "$lib/message";
import { app } from "$lib/state.svelte";
import { Viewer } from "$lib/viewer.svelte";
import { defineHandler } from "../helper";

export default defineHandler({
	name: "clearchat",
	handle(data, channel) {
		// Return early if the message isn't recent and the user is a moderator
		// in the channel to prevent showing two different messages.
		if (!data.is_recent && app.user?.moderating.has(data.channel_login)) {
			return;
		}

		const message = new SystemMessage(data);

		if (data.action.type === "clear") {
			channel.clearMessages();
			channel.addMessage(message.clear());
			return;
		}

		let target = channel.viewers.get(data.action.user_login);

		target ??= new Viewer({
			id: data.action.user_id,
			username: data.action.user_login,
			displayName: data.action.user_login,
		});

		channel.clearMessages(target.id);

		if (data.action.type === "ban") {
			channel.addMessage(message.banStatus(false, null, target));
		} else {
			channel.addMessage(message.timeout(data.action.duration.secs, null, target));
		}
	},
});
