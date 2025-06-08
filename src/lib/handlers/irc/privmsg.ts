import { UserMessage } from "$lib/message";
import { app } from "$lib/state.svelte";
import { User } from "$lib/user.svelte";
import { defineHandler } from "../helper";

export default defineHandler({
	name: "privmsg",
	async handle(data, channel) {
		const message = new UserMessage(data);

		message.author.isBroadcaster = message.badges.some((b) => b.name === "broadcaster");
		message.author.isMod = data.is_mod;
		message.author.isSub = data.is_subscriber;
		message.author.isVip = message.badges.some((b) => b.name === "vip");
		message.author.isReturning = data.is_returning_chatter;

		message.author.badge = app.u2b.get(message.author.id);
		message.author.paint = app.u2p.get(message.author.id);

		if (message.source && message.source.channel_id !== data.channel_id) {
			const source = channel.viewers.get(message.source.channel_id);

			if (!source?.avatarUrl) {
				const user = await User.from(message.source.channel_id);
				channel.viewers.set(user.id, user);
			}
		}

		channel.addMessage(message);
	},
});
