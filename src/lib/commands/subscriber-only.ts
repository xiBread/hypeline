import { invoke } from "@tauri-apps/api/core";
import { booleanArg, defineCommand } from "./util";

export default defineCommand({
	name: "subscriber-only",
	description: "Restrict chat to subscribers only",
	modOnly: true,
	args: ["enabled"],
	async exec(args, channel) {
		const enabled = booleanArg(args[0]);

		if (enabled === null) {
			channel.error = "Invalid value. Use 'on/off' or 'true/false'.";
			return;
		}

		await invoke("update_chat_settings", {
			broadcasterId: channel.user.id,
			settings: {
				subscriber_only: enabled,
			},
		});
	},
});
