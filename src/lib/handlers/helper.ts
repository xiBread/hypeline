import type { Channel } from "$lib/channel.svelte";
import type { SubscriptionEventMap } from "$lib/twitch/eventsub";
import type { IrcMessageMap } from "$lib/twitch/irc";

type HandlerKey = keyof IrcMessageMap | keyof SubscriptionEventMap;

type HandlerData<K> = K extends keyof IrcMessageMap
	? IrcMessageMap[K]
	: K extends keyof SubscriptionEventMap
		? SubscriptionEventMap[K]
		: never;

export interface Handler<K extends HandlerKey = HandlerKey> {
	name: K;
	handle: (data: HandlerData<K>, channel: Channel) => Promise<void> | void;
}

export function defineHandler<K extends HandlerKey>(handler: Handler<K>) {
	return handler;
}
