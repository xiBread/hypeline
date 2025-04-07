import type { z } from "zod";
import type * as Events from "./events";

export * from "./events";
export * from "./websocket";

export interface EventSubSubscriptionMap {
	"channel.chat.message": z.infer<typeof Events.ChannelChatMessage>;
	"user.update": z.infer<typeof Events.UserUpdate>;
}

export type NotificationPayload = {
	[K in keyof EventSubSubscriptionMap]: {
		type: K;
		event: EventSubSubscriptionMap[K];
	};
}[keyof EventSubSubscriptionMap];
