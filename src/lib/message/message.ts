import type { BaseMessage as BaseMessageData } from "$lib/twitch/eventsub";
import { formatTime } from "$lib/util";
import type { SystemMessageData, UserMessage } from "./";

export type MessageData = BaseMessageData | SystemMessageData;

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
			return this.data.message.text;
		}

		return (this.data as SystemMessageData).text;
	}

	public isUser(): this is UserMessage {
		return !this.#system;
	}
}
