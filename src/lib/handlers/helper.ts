import type { IrcMessageMap } from "$lib/twitch/irc";

export interface Handler<K extends keyof IrcMessageMap> {
	name: K;
	handle: (data: IrcMessageMap[K]) => Promise<void> | void;
}

export function defineHandler<K extends keyof IrcMessageMap>(
	handler: Handler<K>,
) {
	return handler;
}
