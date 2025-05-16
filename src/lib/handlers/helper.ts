import type { Channel } from "$lib/channel.svelte";
import type { SevenTvEventMap } from "$lib/seventv";
import type { SubscriptionEventMap } from "$lib/twitch/eventsub";
import type { IrcMessageMap } from "$lib/twitch/irc";

type HandlerKey = keyof IrcMessageMap | keyof SubscriptionEventMap | keyof SevenTvEventMap;

type HandlerData<K> = K extends keyof IrcMessageMap
	? IrcMessageMap[K]
	: K extends keyof SubscriptionEventMap
		? SubscriptionEventMap[K]
		: K extends keyof SevenTvEventMap
			? SevenTvEventMap[K]
			: never;

export interface Handler<K extends HandlerKey = HandlerKey> {
	name: K;
	handle: (data: HandlerData<K>, channel: Channel) => Promise<void> | void;
}

export function defineHandler<K extends HandlerKey>(handler: Handler<K>) {
	return handler;
}
