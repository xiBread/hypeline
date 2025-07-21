import { invoke } from "@tauri-apps/api/core";
import { defineCommand, getTarget } from "./util";

export default defineCommand({
	name: "vip",
	description: "Grant VIP status to a user",
	broadcasterOnly: true,
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
			await invoke("add_vip", {
				broadcasterId: channel.user.id,
				userId: target.id,
			});
		} catch (error) {
			if (typeof error !== "string") return;

			if (error.includes("already")) {
				channel.error = `${target.displayName} is already a VIP.`;
			} else if (error.includes("moderator")) {
				channel.error = `${target.displayName} is a moderator and cannot be made a VIP.`;
			} else {
				channel.error = "An unknown error occurred while trying to add VIP.";
			}
		}
	},
});
