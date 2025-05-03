import type { PartialUser } from "$lib/user";
import { formatDuration } from "$lib/util";
import type { Viewer } from "$lib/viewer.svelte";
import { Message } from "./message";

export interface SystemMessageData {
	is_recent: boolean;
	server_timestamp: number;
}

// Only for syntax highlighting
const html = String.raw;

/**
 * System messages are messages constructed internally and sent to relay
 * information to the user.
 */
export class SystemMessage extends Message {
	#text = "";

	public constructor(data: Partial<SystemMessageData> = {}) {
		const prepared: SystemMessageData = {
			is_recent: data.is_recent ?? false,
			server_timestamp: data.server_timestamp ?? Date.now(),
		};

		super(prepared, true);
	}

	/**
	 * Creates a new system message with its text set to `Joined {channel}`.
	 */
	public static joined(channel: Viewer) {
		const message = new SystemMessage();

		return message.setText(`Joined ${message.#name(channel)}`);
	}

	public override get id() {
		return crypto.randomUUID();
	}

	public override get text() {
		return this.#text;
	}

	/**
	 * Sets the text of the system message when a user is banned in a channel.
	 *
	 * - `{user} has been banned` for `CLEARCHAT` messages
	 * - `{moderator} banned {user}` for `channel.moderate` events
	 */
	public ban(user: Viewer, moderator?: Viewer) {
		const target = this.#name(user);

		this.#text = moderator
			? `${this.#name(moderator)} banned ${target}`
			: `${target} has been banned`;

		return this;
	}

	public timeout(seconds: number, user: Viewer, moderator?: Viewer) {
		const target = this.#name(user);
		const duration = formatDuration(seconds);

		this.#text = moderator
			? `${this.#name(moderator)} timed out ${target} for ${duration}`
			: `${target} has been timed out for ${duration}`;

		return this;
	}

	#name(user: PartialUser) {
		return html`
			<span class="font-semibold" style="color: ${user.color};">
				${user.displayName}
			</span>
		`;
	}

	public setText(text: string) {
		this.#text = text;
		return this;
	}
}
