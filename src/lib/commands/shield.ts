import { invoke } from "@tauri-apps/api/core";
import { defineCommand } from "./util";

export default defineCommand({
	name: "shield",
	description: "Restrict chat and ban harassing chatters",
	args: [{ name: "enabled", required: false }],
	async exec(args, channel) {
		args[0] = args[0]?.toLowerCase();

		const enabled = !args[0] || args[0] === "on" || args[0] === "true";
		const disabled = args[0] === "off" || args[0] === "false";

		if (!enabled && !disabled) {
			channel.error = "Invalid value. Use 'on/off' or 'true/false'.";
			return;
		}

		try {
			await invoke("shield", {
				broadcasterId: channel.user.id,
				active: enabled || !disabled,
			});
		} catch (error) {
			console.log(error);
			channel.error = "An unknown error occurred while trying to update shield mode.";
		}
	},
});
