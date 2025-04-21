import channelChatMessage from "./channel-chat-message";
import channelChatMessageDelete from "./channel-chat-message-delete";
import channelChatNotification from "./channel-chat-notification";
import type { Handler } from "./helper";

export const handlers = new Map<string, Handler<any>>();

function register(handler: Handler<any>) {
	handlers.set(handler.name, handler);
}

register(channelChatMessage);
register(channelChatMessageDelete);
register(channelChatNotification);
