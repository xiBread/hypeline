import { invoke } from "@tauri-apps/api/core";
import { defineCommand, getTarget } from "./util";

export default defineCommand({
	name: "ban",
	description: "Permanently ban a user from chat",
	args: [
		{ name: "username", required: true },
		{ name: "reason", required: false },
	],
	async exec(args, channel) {
		const target = await getTarget(args[0], channel);
		if (!target) return;

		try {
			await invoke("ban", {
				broadcasterId: channel.user.id,
				userId: target.id,
				duration: null,
				reason: args.slice(1).join(" ") || null,
			});
		} catch (error) {}
	},
});
