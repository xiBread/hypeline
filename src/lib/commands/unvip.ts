import { invoke } from "@tauri-apps/api/core";
import { defineCommand, getTarget } from "./util";

export default defineCommand({
	name: "unvip",
	description: "Revoke VIP status from a user",
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
			await invoke("remove_vip", {
				broadcasterId: channel.user.id,
				userId: target.id,
			});
		} catch (error) {
			if (typeof error !== "string") return;

			if (error.includes("is not")) {
				channel.error = `${target.displayName} is not a VIP.`;
			} else {
				channel.error = "An unknown error occurred while trying to remove VIP.";
			}
		}
	},
});
