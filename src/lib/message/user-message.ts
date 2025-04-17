import type { ChannelChatMessage, MessageReply } from "$lib/twitch/eventsub";
import { TextMessage } from "./text-message";

export class UserMessage extends TextMessage {
	public constructor(public readonly data: ChannelChatMessage) {
		super(data);
	}

	public get text() {
		return this.data.message.text;
	}

	public get reply(): MessageReply | null {
		return this.data.reply ?? null;
	}

	public isReply(): this is UserMessage & { reply: MessageReply } {
		return this.data.reply != null;
	}

	public isChannelPointsHighlight() {
		return this.data.message_type === "channel_points_highlighted";
	}
}
