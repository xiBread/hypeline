import { invoke } from "@tauri-apps/api/core";
import { booleanArg, defineCommand } from "./util";

export default defineCommand({
	name: "follower-only",
	description: "Restrict chat to followers based on their follow duration",
	modOnly: true,
	args: ["enabled", "duration"],
	async exec(args, channel) {
		let enabled: boolean | null = true;
		let duration = 0;

		// Ambiguous case
		if (args.length === 1) {
			// Try to parse as boolean first
			enabled = booleanArg(args[0]);

			// Invalid boolish value, assume duration
			if (enabled === null) {
				enabled = true;
				duration = Number(args[0]) || 0;
			}
		}
		// Both provided
		else if (args.length === 2) {
			enabled = booleanArg(args[0]);
			duration = Number(args[1]) || 0;
		}

		if (enabled === null) {
			channel.error = "Invalid value. Use 'on/off' or 'true/false'.";
			return;
		}

		if (duration < 0 || duration > 129600) {
			channel.error = "Duration must be between 0 and 129,600 minutes (3 months).";
			return;
		}

		await invoke("update_chat_settings", {
			broadcasterId: channel.user.id,
			settings: {
				follower_only: enabled,
				follower_only_duration: duration,
			},
		});
	},
});
