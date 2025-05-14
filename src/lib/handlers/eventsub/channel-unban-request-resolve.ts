import { SystemMessage } from "$lib/message";
import { app } from "$lib/state.svelte";
import type { WithModerator } from "$lib/twitch/eventsub";
import { Viewer } from "$lib/viewer.svelte";
import { defineHandler } from "../helper";

export default defineHandler({
	name: "channel.unban_request.resolve",
	handle(data) {
		if (!app.active) return;

		const message = new SystemMessage();
		let moderator: Viewer | undefined;

		if (data.moderator_user_login) {
			moderator = Viewer.fromMod(data as WithModerator);
		}

		app.active.addMessage(message.unbanRequest(data, moderator));
	},
});
