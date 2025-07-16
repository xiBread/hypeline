import { invoke } from "@tauri-apps/api/core";
import type { Channel } from "$lib/channel.svelte";
import type { UserWithColor } from "$lib/tauri";
import { User } from "$lib/user.svelte";
import { find } from "$lib/util";

export interface CommandArg {
	name: string;
	required: boolean;
}

export interface Command {
	name: string;
	description: string;
	args?: CommandArg[];
	mod?: boolean;
	exec: (args: string[], channel: Channel, user: User) => Promise<void>;
}

export function defineCommand(command: Command) {
	return command;
}

export async function getTarget(username: string, channel: Channel) {
	username = username.toLowerCase();

	let target = find(channel.viewers, (user) => user.username === username);

	if (!target) {
		const fetched = await invoke<UserWithColor>("get_user_from_login", {
			login: username,
		});

		if (fetched) {
			target = new User(fetched);
		}
	}

	return target;
}
