import type { User } from "$lib/user";
import { Message } from "./message";

export interface SystemMessageData {
	id: string;
	text: string;
}

// Only for syntax highlighting
const html = String.raw;

export class SystemMessage extends Message {
	public constructor(text: string) {
		super({ id: crypto.randomUUID(), text }, true);
	}

	public static joined(user: User) {
		return new SystemMessage(html`
			Joined
			<span class="font-semibold" style="color: ${user.color};">
				${user.displayName}
			</span>
		`);
	}
}
