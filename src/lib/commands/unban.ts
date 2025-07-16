import { invoke } from "@tauri-apps/api/core";
import { defineCommand, getTarget } from "./util";

export default defineCommand({
	name: "unban",
	description: "Remove a permanent ban on a user",
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
			await invoke("unban", {
				broadcasterId: channel.user.id,
				userId: target.id,
			});
		} catch (error) {}
	},
});
