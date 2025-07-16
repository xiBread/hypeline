import { invoke } from "@tauri-apps/api/core";
import { defineCommand, getTarget } from "./util";

export default defineCommand({
	name: "timeout",
	description: "Temporarily restrict a user from sending messages",
	args: [
		{ name: "username", required: true },
		{ name: "duration", required: false },
		{ name: "reason", required: false },
	],
	async exec(args, channel) {
		const target = await getTarget(args[0], channel);
		if (!target) return;

		try {
			await invoke("ban", {
				broadcasterId: channel.user.id,
				userId: target.id,
				duration: Number(args[1]) || 600,
				reason: args.slice(2).join(" ") || null,
			});
		} catch (error) {}
	},
});
