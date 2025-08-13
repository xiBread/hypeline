import { invoke } from "@tauri-apps/api/core";
import { defineCommand, parseDuration } from "./util";

export default defineCommand({
	name: "slow",
	description: "Limit how frequently users can send messages",
	modOnly: true,
	args: ["duration"],
	async exec(args, channel) {
		const duration = parseDuration(args[0]) ?? 30;

		if (duration !== 0 && (duration < 3 || duration > 120)) {
			channel.error = "Duration must be between 3 and 120 seconds (2 minutes).";
			return;
		}

		await invoke("update_chat_settings", {
			broadcasterId: channel.user.id,
			settings: {
				slow_mode: duration,
			},
		});
	},
});
