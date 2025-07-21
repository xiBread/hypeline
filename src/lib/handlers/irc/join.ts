import { SystemMessage } from "$lib/message";
import { app } from "$lib/state.svelte";
import { find } from "$lib/util";
import { defineHandler } from "../helper";

export default defineHandler({
	name: "join",
	async handle(data, channel) {
		// Channel should always have itself in its viewers map
		const user = find(channel.viewers, (user) => user.username === data.channel_login);
		if (!user) return;

		if (app.user) {
			app.user.isBroadcaster = app.user.id === channel.user.id;
		}

		channel.messages.push(SystemMessage.joined(user));
	},
});
