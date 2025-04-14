import type { ChannelChatMessage, ChannelChatNotification } from "$lib/twitch";
import type { NotificationMessage } from "./notification-message";
import type { SystemMessage, SystemMessageData } from "./system-message";
import type { UserMessage } from "./user-message";

export type Message = UserMessage | NotificationMessage | SystemMessage;

export type MessageData =
	| ChannelChatMessage
	| ChannelChatNotification
	| SystemMessageData;

export class BaseMessage {
	public readonly timestamp = new Date();

	public constructor(readonly data: MessageData) {}

	public isUser(): this is UserMessage {
		return Object.hasOwn(this.data, "message_type");
	}

	public isNotification(): this is NotificationMessage {
		return Object.hasOwn(this.data, "system_message");
	}

	public isSystem(): this is NotificationMessage {
		return !this.isUser() && !this.isSystem();
	}
}
