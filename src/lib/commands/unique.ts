import { invoke } from "@tauri-apps/api/core";
import { booleanArg, defineCommand } from "./util";

export default defineCommand({
	name: "unique",
	description: "Prevent users from sending duplicate messages",
	modOnly: true,
	args: ["unique"],
	async exec(args, channel) {
		const enabled = booleanArg(args[0]);

		if (enabled === null) {
			channel.error = "Invalid value. Use 'on/off' or 'true/false'.";
			return;
		}

		await invoke("update_chat_settings", {
			broadcasterId: channel.user.id,
			settings: {
				unique: enabled,
			},
		});
	},
});
