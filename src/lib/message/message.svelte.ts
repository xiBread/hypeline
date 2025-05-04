import type { BaseUserMessage } from "$lib/twitch/irc";
import { formatTime } from "$lib/util";
import type { SystemMessageData, UserMessage } from ".";

export type MessageData = BaseUserMessage | SystemMessageData;

export abstract class Message {
	#deleted = $state(false);
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
		this.#deleted = data.deleted;
		this.#system = system;

		this.timestamp = new Date(this.data.server_timestamp);
	}

	public abstract get id(): string;
	public abstract get text(): string;

	/**
	 * Whether the message has been deleted.
	 */
	public get deleted() {
		return this.#deleted;
	}

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

	public setDeleted() {
		this.#deleted = true;
		return this;
	}
}
