import { SystemMessage } from "$lib/message";
import { app } from "$lib/state.svelte";
import { Viewer } from "$lib/viewer.svelte";
import { defineHandler } from "../helper";

export default defineHandler({
	name: "stream.online",
	handle(data) {
		const message = new SystemMessage();

		const broadcaster = Viewer.from({
			id: data.broadcaster_user_id,
			login: data.broadcaster_user_login,
			name: data.broadcaster_user_name,
		});

		app.active.addMessage(message.streamStatus(true, broadcaster));
	},
});
