import { UserMessage } from "$lib/message";
import type { Boundary } from "$lib/twitch/eventsub";
import { defineHandler } from "../helper";

export default defineHandler({
	name: "automod.message.hold",
	handle(data, channel) {
		const isAutoMod = data.reason === "automod";
		data.message.message_id = data.message_id;

		const message = UserMessage.from(data.message, {
			id: data.user_id,
			login: data.user_login,
			name: data.user_name,
		});

		const boundaries: Boundary[] = [];

		if (isAutoMod) {
			for (const boundary of data.automod.boundaries) {
				boundaries.push(boundary);
			}
		} else {
			for (const term of data.blocked_term.terms_found) {
				boundaries.push(term.boundary);
			}
		}

		let reason = "for using blocked terms";

		if (isAutoMod) {
			const { category } = data.automod;

			if (category === "smartdetection") {
				reason = "by smart detection";
			} else {
				reason = `for ${category}`;
			}
		}

		message.addAutoModMetadata({
			category: reason,
			level: isAutoMod ? data.automod.level : Number.NaN,
			boundaries,
		});

		channel.addMessage(message);
	},
});
