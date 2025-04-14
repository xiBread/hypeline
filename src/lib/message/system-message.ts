import { BaseMessage } from "./message";

export interface SystemMessageData {
	text: string;
}

export class SystemMessage extends BaseMessage {
	public constructor(public readonly text: string) {
		super({ text });
	}
}
