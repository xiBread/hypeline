import { SystemMessage } from "$lib/message";
import type { WithModerator } from "$lib/twitch/eventsub";
import { Viewer } from "$lib/viewer.svelte";
import { defineHandler } from "../helper";

export default defineHandler({
	name: "channel.unban_request.resolve",
	handle(data, channel) {
		const message = new SystemMessage();
		let moderator: Viewer | undefined;

		if (data.moderator_user_login) {
			moderator = Viewer.fromMod(data as WithModerator);
		}

		channel.addMessage(message.unbanRequest(data, moderator));
	},
});
