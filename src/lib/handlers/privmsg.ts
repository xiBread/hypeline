import { UserMessage } from "$lib/message";
import { app } from "$lib/state.svelte";
import { defineHandler } from "./helper";

export default defineHandler({
	name: "privmsg",
	handle(data) {
		const message = new UserMessage(data);

		const storedViewer = app.active.viewers.get(message.viewer.username);
		const viewer = storedViewer ?? message.viewer;

		const badges = message.badges.map((b) => b.name);

		if (badges.includes("broadcaster")) {
			viewer.broadcaster = true;
		}

		if (badges.includes("moderator")) {
			viewer.moderator = true;
		}

		if (!storedViewer) {
			app.active.viewers.set(message.viewer.username, viewer);
		}

		app.active.messages.push(message);
	},
});
