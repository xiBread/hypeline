import { SystemMessage } from "$lib/message";
import { Viewer } from "$lib/viewer.svelte";
import { defineHandler } from "../helper";

export default defineHandler({
	name: "channel.suspicious_user.update",
	handle(data, channel) {
		const message = new SystemMessage();
		const status = data.low_trust_status;

		const moderator = Viewer.fromMod(data);
		const viewer = Viewer.fromBasic(data);

		// Only update status if the viewer is not already monitored or
		// restricted.
		if (!viewer.monitored && !viewer.restricted) {
			// No previous information available so it doesn't make sense to
			// send the message since we don't know what changed.
			if (status === "no_treatment") return;

			viewer.monitored = status === "active_monitoring";
			viewer.restricted = status === "restricted";
		}

		channel.addMessage(
			message.setContext({
				type: "suspicionStatus",
				active: status !== "no_treatment",
				previous: viewer.monitored
					? "monitoring"
					: viewer.restricted
						? "restricting"
						: null,
				user: viewer,
				moderator,
			}),
		);

		// Update AFTER message is sent so the previous status is available.
		viewer.monitored = status === "active_monitoring";
		viewer.restricted = status === "restricted";
	},
});
