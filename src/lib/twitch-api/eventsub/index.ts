import type * as Events from "./events";

export * from "./events";
export * from "./websocket";

export interface EventSubSubscriptionMap {
	"channel.chat.message": typeof Events.ChannelChatMessage;
	"user.update": typeof Events.UserUpdate;
}

export type NotificationPayload = {
	[K in keyof EventSubSubscriptionMap]: {
		type: K;
		event: EventSubSubscriptionMap[K]["_output"];
	};
}[keyof EventSubSubscriptionMap];
