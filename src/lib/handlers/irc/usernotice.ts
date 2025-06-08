import { UserMessage } from "$lib/message";
import { User } from "$lib/user.svelte";
import { defineHandler } from "../helper";

export default defineHandler({
	name: "usernotice",
	async handle(data, channel) {
		const message = new UserMessage(data);

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
