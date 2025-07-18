import { invoke } from "@tauri-apps/api/core";
import { defineCommand, getTarget } from "./util";

export default defineCommand({
	name: "mod",
	description: "Grant moderator status to a user",
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
			await invoke("add_moderator", {
				broadcasterId: channel.user.id,
				userId: target.id,
			});
		} catch (error) {
			console.log(error);
			if (typeof error !== "string") return;

			if (error.includes("already")) {
				channel.error = `${target.displayName} is already a moderator.`;
			} else if (error.includes("banned")) {
				channel.error = `${target.displayName} is banned and cannot be made a moderator.`;
			} else if (error.includes("vip")) {
				channel.error = `${target.displayName} is a VIP and cannot be made a moderator.`;
			} else {
				channel.error = "An unknown error occurred while trying to add moderator.";
			}
		}
	},
});
