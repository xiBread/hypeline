import type { BaseUserMessage, UserNoticeMessage } from "$lib/twitch/irc";
import { formatTime } from "$lib/util";
import type { SystemMessageData, UserMessage } from "./";

export type MessageData = BaseUserMessage | SystemMessageData;

export abstract class Message {
	#system: boolean;

	/**
	 * The timestamp at which the message was sent at. For a human-readable
	 * format, use {@linkcode formattedTime}.
	 */
	public readonly timestamp = new Date();

	public constructor(
		readonly data: MessageData,
		system = false,
	) {
		this.#system = system;

		if (this.isUser()) {
			this.timestamp = new Date(
				(this.data as BaseUserMessage).server_timestamp,
			);
		}
	}

	public get id(): string {
		if (this.isUser()) {
			return this.data.message_id;
		}

		return (this.data as SystemMessageData).id;
	}

	public get formattedTime(): string {
		return formatTime(this.timestamp);
	}

	public get text(): string {
		if (this.isUser()) {
			// message_text should only be possibly null if it's a USERNOTICE,
			// in which case we can assume system_message is present
			return (
				this.data.message_text ??
				(this.data as UserNoticeMessage).system_message
			);
		}

		return (this.data as SystemMessageData).text;
	}

	public isUser(): this is UserMessage {
		return !this.#system;
	}
}
