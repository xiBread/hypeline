import { invoke } from "@tauri-apps/api/core";
import { defineCommand } from "./util";

export default defineCommand({
	name: "clear",
	description: "Clear chat history for non-moderator viewers",
	modOnly: true,
	async exec(_, channel) {
		try {
			await invoke("clear_chat", { broadcasterId: channel.user.id });
		} catch {
			channel.error = "An unknown error occurred while trying to clear chat.";
		}
	},
});
