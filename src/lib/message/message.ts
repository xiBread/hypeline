import type { BaseMessage as BaseMessageData } from "$lib/twitch/eventsub";
import { formatTime } from "$lib/util";
import type { SystemMessageData } from "./system-message";
import type { UserMessage } from "./user-message";

export type MessageData = BaseMessageData | SystemMessageData;

export abstract class Message {
	#system: boolean;
	public readonly timestamp = new Date();

	public constructor(
		readonly data: MessageData,
		system = false,
	) {
		this.#system = system;
	}

	public get id(): string {
		if (this.#system) {
			return (this.data as SystemMessageData).id;
		}

		return (this.data as BaseMessageData).message_id;
	}

	public get formattedTime() {
		return formatTime(this.timestamp);
	}

	public isUser(): this is UserMessage {
		return !this.#system;
	}
}
