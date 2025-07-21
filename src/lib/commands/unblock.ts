import { invoke } from "@tauri-apps/api/core";
import { defineCommand, getTarget } from "./util";
import { SystemMessage } from "$lib/message";

export default defineCommand({
	name: "unblock",
	description: "Remove a user from your block list",
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
			await invoke("unblock", { userId: target.id });

			const message = new SystemMessage();

			message.setContext({
				type: "blockStatus",
				blocked: false,
				user: target,
			});

			channel.addMessage(message);
		} catch {
			channel.error = "An unknown error occurred while trying to unblock.";
		}
	},
});
