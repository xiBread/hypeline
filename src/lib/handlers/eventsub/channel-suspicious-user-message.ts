import { UserMessage } from "$lib/message";
import { defineHandler } from "../helper";

export default defineHandler({
	name: "channel.suspicious_user.message",
	handle(data, channel) {
		const message = UserMessage.from(data.message, {
			id: data.user_id,
			login: data.user_login,
			name: data.user_name,
		});

		message.viewer.monitored = data.low_trust_status === "active_monitoring";
		message.viewer.restricted = data.low_trust_status === "restricted";
		message.viewer.banEvasion = data.ban_evasion_evaluation;

		channel.addMessage(message);
	},
});
