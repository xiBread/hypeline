import { invoke } from "@tauri-apps/api/core";
import { defineCommand, parseBool } from "./util";

export default defineCommand({
	name: "shield",
	description: "Restrict chat and ban harassing chatters",
	modOnly: true,
	args: ["enabled"],
	async exec(args, channel) {
		const enabled = parseBool(args[0]);

		if (enabled === null) {
			channel.error = "Invalid value. Use 'on/off' or 'true/false'.";
			return;
		}

		await invoke("shield", {
			broadcasterId: channel.user.id,
			active: enabled,
		});
	},
});
