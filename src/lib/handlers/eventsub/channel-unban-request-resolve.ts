import { SystemMessage } from "$lib/message";
import type { WithModerator } from "$lib/twitch/eventsub";
import { User } from "$lib/user.svelte";
import { defineHandler } from "../helper";

export default defineHandler({
	name: "channel.unban_request.resolve",
	handle(data, channel) {
		const message = new SystemMessage();

		let moderator: User | undefined;

		if (data.moderator_user_id) {
			moderator = User.fromModerator(data as WithModerator);
		}

		channel.addMessage(
			message.setContext({
				type: "unbanRequest",
				request: data,
				user: User.fromBasic(data),
				moderator,
			}),
		);
	},
});
