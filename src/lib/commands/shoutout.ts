import { invoke } from "@tauri-apps/api/core";
import { defineCommand, getTarget } from "./util";

export default defineCommand({
	name: "shoutout",
	description: "Highlight a channel for viewers to follow",
	args: [
		{
			name: "channel",
			required: true,
		},
	],
	async exec(args, channel) {
		const target = await getTarget(args[0], channel);
		if (!target) return;

		if (!channel.stream) {
			channel.error = "The channel must be live to send a shoutout.";
			return;
		}

		if (channel.user.id === target.id) {
			channel.error = "The broadcaster cannot shoutout themselves.";
			return;
		}

		try {
			await invoke("shoutout", { fromId: channel.user.id, toId: target.id });
		} catch (error) {
			channel.error = "An unknown error occurred while trying to send a shoutout.";
		}
	},
});
