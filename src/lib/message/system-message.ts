import { Message } from "./message";

export interface SystemMessageData {
	id: string;
	text: string;
}

export class SystemMessage extends Message {
	public constructor(public readonly text: string) {
		super({ id: crypto.randomUUID(), text }, true);
	}
}
