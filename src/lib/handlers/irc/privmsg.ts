import { UserMessage } from "$lib/message";
import { app } from "$lib/state.svelte";
import { defineHandler } from "../helper";

export default defineHandler({
	name: "privmsg",
	handle(data, channel) {
		const message = new UserMessage(data);

		message.author.isBroadcaster = message.badges.some((b) => b.name === "broadcaster");
		message.author.isMod = data.is_mod;
		message.author.isSub = data.is_subscriber;
		message.author.isVip = message.badges.some((b) => b.name === "vip");
		message.author.isReturning = data.is_returning_chatter;

		message.author.badge = app.u2b.get(message.author.username);
		message.author.paint = app.u2p.get(message.author.username);

		if (!channel.viewers.has(message.author.username)) {
			channel.viewers.set(message.author.username, message.author);
		}

		channel.addMessage(message);
	},
});
