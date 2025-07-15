import { invoke } from "@tauri-apps/api/core";
import { defineCommand } from "./helper";
import { find } from "$lib/util";
import type { UserWithColor } from "$lib/tauri";
import { User } from "$lib/user.svelte";

export default defineCommand({
	name: "unban",
	description: "Remove a permanent ban on a user",
	args: [
		{
			name: "username",
			required: true,
		},
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
			await invoke("unban", {
				broadcasterId: channel.user.id,
				userId: target.id,
			});
		} catch (error) {}
	},
});
