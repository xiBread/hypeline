import { invoke } from "@tauri-apps/api/core";
import { booleanArg, defineCommand } from "./util";

export default defineCommand({
	name: "emote-only",
	description: "Restrict chat to emote only messages",
	modOnly: true,
	args: ["enabled"],
	async exec(args, channel) {
		const enabled = booleanArg(args[0]);

		if (enabled === null) {
			channel.error = "Invalid value. Use 'on/off' or 'true/false'.";
			return;
		}

		try {
			await invoke("update_chat_settings", {
				broadcasterId: channel.user.id,
				settings: {
					emote_only: enabled,
				},
			});
		} catch {
			channel.error = "An unknown error occurred while trying to enable emote-only mode.";
		}
	},
});
