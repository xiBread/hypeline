import { defineHandler } from "../helper";

export default defineHandler({
	name: "part",
	handle(_, channel) {
		channel.history = [];
		channel.messages = [];
		channel.badges.clear();
		channel.emotes.clear();
		channel.viewers.clear();
	},
});
