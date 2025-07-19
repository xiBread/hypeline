import { invoke } from "@tauri-apps/api/core";
import { defineCommand } from "./util";

export default defineCommand({
	name: "slow",
	description: "Limit how frequently users can send messages",
	args: [
		{
			name: "duration",
			required: false,
		},
	],
	async exec(args, channel) {
		let duration = Number(args[0]);
		duration = Number.isNaN(duration) ? 30 : duration;

		if (duration !== 0 && (duration < 3 || duration > 120)) {
			channel.error = "Duration must be between 3 and 120 seconds (2 minutes).";
			return;
		}

		try {
			await invoke("update_chat_settings", {
				broadcasterId: channel.user.id,
				settings: {
					slow_mode: duration,
				},
			});
		} catch {
			channel.error = "An unknown error occurred while trying to update slow mode.";
		}
	},
});
