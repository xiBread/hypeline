import type { Channel } from "$lib/channel.svelte";
import type { User } from "$lib/user.svelte";

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
