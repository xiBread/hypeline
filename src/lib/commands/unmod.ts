import { invoke } from "@tauri-apps/api/core";
import { defineCommand, getTarget } from "./util";

export default defineCommand({
	name: "unmod",
	description: "Revoke moderator status from a user",
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
			await invoke("remove_moderator", {
				broadcasterId: channel.user.id,
				userId: target.id,
			});
		} catch (error) {
			if (typeof error !== "string") return;

			if (error.includes("is not")) {
				channel.error = `${target.displayName} is not a moderator.`;
			} else {
				channel.error = "An unknown error occurred while trying to remove moderator.";
			}
		}
	},
});
