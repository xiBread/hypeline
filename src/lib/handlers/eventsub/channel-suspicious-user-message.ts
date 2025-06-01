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

		message.author.monitored = data.low_trust_status === "active_monitoring";
		message.author.restricted = data.low_trust_status === "restricted";
		message.author.banEvasion = data.ban_evasion_evaluation;

		channel.addMessage(message);
	},
});
