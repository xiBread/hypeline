import { invoke } from "@tauri-apps/api/core";
import { defineCommand, getTarget } from "./util";

export default defineCommand({
	name: "ban",
	description: "Permanently ban a user from chat",
	modOnly: true,
	args: ["username", "reason"],
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
		} catch (error) {
			if (typeof error !== "string") return;

			if (error.includes("already banned")) {
				channel.error = `${target.displayName} is already banned.`;
			} else if (error.includes("may not be banned")) {
				channel.error = `${target.displayName} may not be banned.`;
			} else {
				channel.error = "An unknown error occurred while trying to ban.";
			}
		}
	},
});
