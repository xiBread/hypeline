import { UserMessage } from "$lib/message";
import { app } from "$lib/state.svelte";
import { extractEmotes } from "$lib/util";
import { defineHandler } from "../helper";

export default defineHandler({
	name: "channel.suspicious_user.message",
	handle(data) {
		const isAction = /^\x01ACTION.*$/.test(data.message.text);
		const text = isAction ? data.message.text.slice(8, -1) : data.message.text;

		const message = new UserMessage({
			type: "privmsg",
			badge_info: [],
			badges: [],
			bits: data.message.fragments.reduce((a, b) => {
				return a + (b.type === "cheermote" ? b.cheermote.bits : 0);
			}, 0),
			channel_id: "",
			channel_login: "",
			deleted: false,
			emotes: extractEmotes(data.message.fragments),
			message_id: data.message.message_id,
			message_text: text,
			name_color: "",
			is_action: isAction,
			is_first_msg: false,
			is_highlighted: false,
			is_mod: false,
			is_subscriber: false,
			is_recent: false,
			is_returning_chatter: false,
			reply: null,
			sender: {
				id: data.user_id,
				login: data.user_login,
				name: data.user_name,
			},
			server_timestamp: Date.now(),
		});

		message.viewer.monitored = data.low_trust_status === "active_monitoring";
		message.viewer.restricted = data.low_trust_status === "restricted";
		message.viewer.banEvasion = data.ban_evasion_evaluation;

		app.active.addMessage(message);
	},
});
