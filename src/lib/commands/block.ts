import { invoke } from "@tauri-apps/api/core";
import { SystemMessage } from "$lib/message";
import { defineCommand, getTarget } from "./util";

export default defineCommand({
	name: "block",
	description: "Block a user from interacting with you on Twitch",
	args: ["username"],
	async exec(args, channel) {
		const target = await getTarget(args[0], channel);
		if (!target) return;

		try {
			await invoke("block", { userId: target.id });

			const message = new SystemMessage();

			message.setContext({
				type: "blockStatus",
				blocked: true,
				user: target,
			});

			channel.addMessage(message);
		} catch {
			channel.error = "An unknown error occurred while trying to block.";
		}
	},
});
