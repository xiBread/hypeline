import { UserMessage } from "$lib/message";
import { app } from "$lib/state.svelte";
import { defineHandler } from "./helper";

export default defineHandler({
	name: "usernotice",
	handle(data) {
		app.active.messages.push(new UserMessage(data));
	},
});
