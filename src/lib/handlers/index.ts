import type { EventSubSubscriptionMap } from "$lib/twitch";

export interface Handler<K extends keyof EventSubSubscriptionMap> {
	name: K;
	handle: (data: EventSubSubscriptionMap[K]) => Promise<void> | void;
}

export function defineHandler<K extends keyof EventSubSubscriptionMap>(
	handler: Handler<K>,
) {
	return handler;
}
