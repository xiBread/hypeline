import { invoke } from "@tauri-apps/api/core";
import type { UserWithColor } from "$lib/tauri";
import { User } from "$lib/user.svelte";
import { find } from "$lib/util";
import { defineCommand } from "./helper";

export default defineCommand({
	name: "timeout",
	description: "Temporarily restrict a user from sending messages",
	args: [
		{ name: "username", required: true },
		{ name: "duration", required: false },
		{ name: "reason", required: false },
	],
	async exec(args, channel) {
		const username = args[0].toLowerCase();
		let target = find(channel.viewers, (user) => user.username === username);

		if (!target) {
			const fetched = await invoke<UserWithColor>("get_user_from_login", {
				login: username,
			});
			if (!fetched) return;

			target = new User(fetched);
		}

		try {
			await invoke("ban", {
				broadcasterId: channel.user.id,
				userId: target.id,
				duration: Number(args[1]) || 600,
				reason: args.slice(2).join(" ") || null,
			});
		} catch (error) {}
	},
});
