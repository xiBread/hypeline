import { invoke } from "@tauri-apps/api/core";
import { defineCommand, getTarget } from "./util";
import { SystemMessage } from "$lib/message";

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
