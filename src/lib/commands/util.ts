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
	broadcasterOnly?: boolean;
	modOnly?: boolean;
	exec: (args: string[], channel: Channel, user: User) => Promise<void>;
}

export function defineCommand(command: Command) {
	return command;
}

export async function getTarget(username: string, channel: Channel) {
	if (!username) {
		channel.error = "Missing username argument.";
		return;
	}

	username = username.toLowerCase();

	let target = find(channel.viewers, (user) => user.username === username);

	if (!target) {
		const fetched = await invoke<UserWithColor | null>("get_user_from_login", {
			login: username,
		});

		if (fetched) {
			target = new User(fetched);
			channel.viewers.set(target.id, target);
		}
	}

	if (!target) {
		channel.error = "User not found.";
		return;
	}

	return target;
}

export function booleanArg(arg: string | undefined): boolean | null {
	if (!arg) return true;

	arg = arg.toLowerCase();

	const truthy = arg === "true" || arg === "on";
	const falsy = arg === "false" || arg === "off";

	return !truthy && !falsy ? null : truthy || !falsy;
}
