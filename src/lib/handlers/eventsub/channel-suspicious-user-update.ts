import { SystemMessage } from "$lib/message";
import { User } from "$lib/user.svelte";
import { defineHandler } from "../helper";

export default defineHandler({
	name: "channel.suspicious_user.update",
	handle(data, channel) {
		const message = new SystemMessage();
		const status = data.low_trust_status;

		const user = User.fromBasic(data);

		// Only update status if the user is not already monitored or
		// restricted.
		if (!user.monitored && !user.restricted) {
			// No previous information available so it doesn't make sense to
			// send the message since we don't know what changed.
			if (status === "no_treatment") return;

			user.monitored = status === "active_monitoring";
			user.restricted = status === "restricted";
		}

		channel.addMessage(
			message.setContext({
				type: "suspicionStatus",
				active: status !== "no_treatment",
				previous: user.monitored ? "monitoring" : user.restricted ? "restricting" : null,
				user,
				moderator: User.fromModerator(data),
			}),
		);

		// Update AFTER message is sent so the previous status is available.
		user.monitored = status === "active_monitoring";
		user.restricted = status === "restricted";
	},
});
