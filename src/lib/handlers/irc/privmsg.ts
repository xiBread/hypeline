import { UserMessage } from "$lib/message";
import { app } from "$lib/state.svelte";
import { defineHandler } from "../helper";

export default defineHandler({
	name: "privmsg",
	handle(data) {
		const message = new UserMessage(data);

		const storedViewer = app.active.viewers.get(message.viewer.username);
		const viewer = storedViewer ?? message.viewer;

		viewer.isBroadcaster = message.badges.some(
			(b) => b.name === "broadcaster",
		);
		viewer.isMod = data.is_mod;
		viewer.isSub = data.is_subscriber;
		viewer.isVip = message.badges.some((b) => b.name === "vip");

		if (!storedViewer) {
			app.active.viewers.set(message.viewer.username, viewer);
		}

		app.active.addMessage(message);
	},
});
