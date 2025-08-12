import { invoke } from "@tauri-apps/api/core";
import { SystemMessage } from "$lib/message";
import { defineCommand, getTarget } from "./util";

export default defineCommand({
	name: "unblock",
	description: "Remove a user from your block list",
	args: ["username"],
	async exec(args, channel) {
		const target = await getTarget(args[0], channel);
		if (!target) return;

		await invoke("unblock", { userId: target.id });

		const message = new SystemMessage();

		message.setContext({
			type: "blockStatus",
			blocked: false,
			user: target,
		});

		channel.addMessage(message);
	},
});
