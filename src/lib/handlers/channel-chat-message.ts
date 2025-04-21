import { UserMessage } from "$lib/message";
import { app } from "$lib/state.svelte";
import { defineHandler } from "./helper";

export default defineHandler({
	name: "channel.chat.message",
	handle(data) {
		const message = new UserMessage(data);
		const chatter = app.active.users.get(message.user.id);
		const user = chatter ?? message.user;

		const badges = message.badges
			.filter(
				(b) => b.set_id === "broadcaster" || b.set_id === "moderator",
			)
			.map((b) => b.set_id);

		if (badges.includes("broadcaster")) {
			user.broadcaster = true;
		}

		if (badges.includes("moderator")) {
			user.mod = true;
		}

		if (!chatter) {
			app.active.users.set(message.user.id, user);
		}

		app.active.messages.push(message);
	},
});
