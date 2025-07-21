import { invoke } from "@tauri-apps/api/core";
import { defineCommand, getTarget } from "./util";

export default defineCommand({
	name: "raid",
	description: "Send viewers to another channel when the stream ends",
	modOnly: true,
	args: ["channel"],
	async exec(args, channel) {
		const target = await getTarget(args[0], channel);
		if (!target) return;

		if (channel.user.id === target.id) {
			channel.error = "The broadcaster cannot raid themselves.";
			return;
		}

		try {
			await invoke("raid", { fromId: channel.user.id, toId: target.id });
		} catch (error) {
			if (typeof error !== "string") return;
		}
	},
});
