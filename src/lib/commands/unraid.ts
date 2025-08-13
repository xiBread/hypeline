import { invoke } from "@tauri-apps/api/core";
import { defineCommand } from "./util";

export default defineCommand({
	name: "unraid",
	description: "Stop an ongoing raid",
	modOnly: true,
	async exec(_, channel) {
		try {
			await invoke("cancel_raid", {
				broadcasterId: channel.user.id,
			});
		} catch (error) {
			if (typeof error !== "string") return;

			if (error.includes("doesn't have")) {
				channel.error = "No pending raid to stop.";
			} else {
				throw error;
			}
		}
	},
});
