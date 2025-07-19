import { invoke } from "@tauri-apps/api/core";
import { defineCommand, getTarget } from "./util";

export default defineCommand({
	name: "block",
	description: "Block a user from interacting with you on Twitch",
	args: [
		{
			name: "username",
			required: true,
		},
	],
	async exec(args, channel) {
		const target = await getTarget(args[0], channel);
		if (!target) return;

		try {
			await invoke("block", { userId: target.id });
		} catch {
			channel.error = "An unknown error occurred while trying to block.";
		}
	},
});
