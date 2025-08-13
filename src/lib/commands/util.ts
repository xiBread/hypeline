import { invoke } from "@tauri-apps/api/core";
import type { Channel } from "$lib/channel.svelte";
import type { UserWithColor } from "$lib/tauri";
import { User } from "$lib/user.svelte";
import { find } from "$lib/util";

export interface Command {
	name: string;
	description: string;
	args?: string[];
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

export function parseBool(arg: string | undefined): boolean | null {
	if (!arg) return true;

	arg = arg.toLowerCase();

	const truthy = arg === "true" || arg === "on";
	const falsy = arg === "false" || arg === "off";

	return truthy ? true : falsy ? false : null;
}

const unitMap: Record<string, number> = {
	s: 1,
	m: 60,
	h: 60 * 60,
	d: 60 * 60 * 24,
	w: 60 * 60 * 24 * 7,
	mo: 60 * 60 * 24 * 30,
};

export function parseDuration(arg: string | undefined): number | null {
	const match = arg ? /^(\d+(?:\.\d+)?)([shdw]|mo?)?$/i.exec(arg) : null;
	if (!match) return null;

	const value = Number(match[1]);
	const unit = match[2].toLowerCase() ?? "s";

	return value * unitMap[unit];
}
