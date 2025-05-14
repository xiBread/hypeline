import { UserMessage } from "$lib/message";
import { defineHandler } from "../helper";

export default defineHandler({
	name: "privmsg",
	handle(data, channel) {
		const message = new UserMessage(data);

		message.viewer.isBroadcaster = message.badges.some((b) => b.name === "broadcaster");
		message.viewer.isMod = data.is_mod;
		message.viewer.isSub = data.is_subscriber;
		message.viewer.isVip = message.badges.some((b) => b.name === "vip");
		message.viewer.isReturning = data.is_returning_chatter;

		if (!channel.viewers.has(message.viewer.username)) {
			channel.viewers.set(message.viewer.username, message.viewer);
		}

		channel.addMessage(message);
	},
});
