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
	public readonly timestamp: Date;

	public constructor(
		readonly data: MessageData,
		system = false,
	) {
		this.#system = system;
		this.timestamp = new Date(this.data.server_timestamp);
	}

	public abstract get id(): string;
	public abstract get text(): string;

	/**
	 * Whether the message was retreived by the `recent-messages` API.
	 */
	public get isRecent() {
		return this.data.is_recent;
	}

	public get formattedTime() {
		return formatTime(this.timestamp);
	}

	public isUser(): this is UserMessage {
		return !this.#system;
	}
}
