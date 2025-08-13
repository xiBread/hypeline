import { SystemMessage } from "$lib/message";
import { find } from "$lib/util";
import { defineHandler } from "../helper";

export default defineHandler({
	name: "join",
	async handle(data, channel) {
		// Channel should always have itself in its viewers map
		const user = find(channel.viewers, (user) => user.username === data.channel_login);
		if (!user) return;

		user.isBroadcaster = true;
		user.isMod = true;

		channel.messages.push(SystemMessage.joined(user));
	},
});
