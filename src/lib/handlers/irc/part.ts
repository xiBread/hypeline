import { app } from "$lib/state.svelte";
import { defineHandler } from "../helper";

export default defineHandler({
	name: "part",
	handle() {
		app.active.history = [];
		app.active.messages = [];
		app.active.badges.clear();
		app.active.emotes.clear();
		app.active.viewers.clear();
	},
});
