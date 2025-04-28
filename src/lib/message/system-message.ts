import type { Viewer } from "$lib/viewer.svelte";
import { Message } from "./message";

export interface SystemMessageData {
	id: string;
	text: string;
}

// Only for syntax highlighting
const html = String.raw;

/**
 * System messages are messages constructed internally and sent to relay
 * information to the user.
 */
export class SystemMessage extends Message {
	public constructor(text: string) {
		super({ id: crypto.randomUUID(), text }, true);
	}

	/**
	 * Creates a `Joined {channel}` system message when joining a channel.
	 */
	public static joined(channel: Viewer) {
		return new SystemMessage(html`
			Joined
			<span class="font-semibold" style="color: ${channel.color};">
				${channel.displayName}
			</span>
		`);
	}
}
