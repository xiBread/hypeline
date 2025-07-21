import { invoke } from "@tauri-apps/api/core";
import { defineCommand, getTarget } from "./util";

export default defineCommand({
	name: "warn",
	description:
		"Issue a warning to a user that they must acknowledge before sending more messages",
	modOnly: true,
	args: ["username", "reason"],
	async exec(args, channel) {
		const target = await getTarget(args[0], channel);
		if (!target) return;

		const reason = args.slice(1).join(" ");

		if (!reason) {
			channel.error = "Missing reason argument.";
			return;
		}

		try {
			await invoke("warn", {
				broadcasterId: channel.user.id,
				userId: target.id,
				reason,
			});
		} catch (error) {
			if (typeof error !== "string") return;

			if (error.includes("may not be warned")) {
				channel.error = `${target.displayName} may not be warned.`;
			} else {
				channel.error = "An unknown error occurred while trying to ban.";
			}
		}
	},
});
