import channelChatMessage from "./channel-chat-message";
import type { Handler } from ".";

export const handlers = new Map<string, Handler<any>>();

function register(handler: Handler<any>) {
	handlers.set(handler.name, handler);
}

register(channelChatMessage);
