import { invoke } from "@tauri-apps/api/core";
import { defineCommand } from "./util";

export default defineCommand({
	name: "announce",
	description: "Call attention to your message with a colored highlight",
	args: [
		{
			name: "message",
			required: true,
		},
	],
	async exec(args, channel, user) {
		// todo: handle empty message

		await invoke("announce", {
			broadcasterId: channel.user.id,
			message: args.join(" "),
		});
	},
});
