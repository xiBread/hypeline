import type { ChannelChatNotification } from "$lib/twitch";
import { BaseMessage } from "./message";

export class NotificationMessage extends BaseMessage {
	public constructor(public readonly data: ChannelChatNotification) {
		super(data);
	}

	public isAnnouncment() {
		// return this.data
	}
}
