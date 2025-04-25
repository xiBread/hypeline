import { UserMessage } from "$lib/message";
import { app } from "$lib/state.svelte";
import { defineHandler } from "./helper";

export default defineHandler({
	name: "privmsg",
	handle(data) {
		const message = new UserMessage(data);
		const viewer =
			app.active.viewers.get(message.viewer.id) ?? message.viewer;

		const badges = message.badges.map((b) => b.name);

		if (badges.includes("broadcaster")) {
			viewer.broadcaster = true;
		}

		if (badges.includes("moderator")) {
			viewer.moderator = true;
		}

		if (!viewer) {
			app.active.viewers.set(message.viewer.id, viewer);
		}

		app.active.messages.push(message);
	},
});
