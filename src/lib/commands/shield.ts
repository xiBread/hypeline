import { invoke } from "@tauri-apps/api/core";
import { booleanArg, defineCommand } from "./util";

export default defineCommand({
	name: "shield",
	description: "Restrict chat and ban harassing chatters",
	modOnly: true,
	args: ["enabled"],
	async exec(args, channel) {
		const enabled = booleanArg(args[0]);

		if (enabled === null) {
			channel.error = "Invalid value. Use 'on/off' or 'true/false'.";
			return;
		}

		try {
			await invoke("shield", {
				broadcasterId: channel.user.id,
				active: enabled,
			});
		} catch (error) {
			channel.error = "An unknown error occurred while trying to update shield mode.";
		}
	},
});
