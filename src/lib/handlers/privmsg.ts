import { UserMessage } from "$lib/message";
import { app } from "$lib/state.svelte";
import { defineHandler } from "./helper";

export default defineHandler({
	name: "privmsg",
	handle(data) {
		const message = new UserMessage(data);

		const storedViewer = app.active.viewers.get(message.viewer.username);
		const viewer = storedViewer ?? message.viewer;

		viewer.isBroadcaster = !!message.badges.find(
			(b) => b.name === "broadcaster",
		);
		viewer.isMod = data.is_mod;
		viewer.isSub = data.is_subscriber;

		if (!storedViewer) {
			app.active.viewers.set(message.viewer.username, viewer);
		}

		app.active.messages.push(message);
	},
});
