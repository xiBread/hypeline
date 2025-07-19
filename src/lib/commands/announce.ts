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
	async exec(args, channel) {
		const message = args.join(" ");

		if (!message) {
			channel.error = "Missing message argument.";
			return;
		}

		try {
			await invoke("announce", {
				broadcasterId: channel.user.id,
				message,
			});
		} catch {
			channel.error = "An unknown error occurred while trying to send an announcement.";
		}
	},
});
