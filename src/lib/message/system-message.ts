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
	 * Sets the text of the system message when a user is banned or unbanned in
	 * a channel.
	 *
	 * - `{user} has been banned/unbanned` for `CLEARCHAT` messages
	 * - `{moderator} banned/unbanned {user}` for `channel.moderate` events
	 */
	public banStatus(unbanned: boolean, user: Viewer, moderator?: Viewer) {
		const target = this.#name(user);
		const action = unbanned ? "unbanned" : "banned";

		this.#text = moderator
			? `${this.#name(moderator)} ${action} ${target}`
			: `${target} has been ${action}`;

		return this;
	}

	/**
	 * Sets the text of the system message when the chat is cleared.
	 *
	 * - `The chat has been cleared for non-moderator viewers` for `CLEARCHAT`
	 *   messages
	 * - `{moderator} cleared the chat for non-moderator viewers` for
	 *   `channel.moderate` events
	 */
	public clear(moderator?: Viewer) {
		this.#text = moderator
			? `${this.#name(moderator)} cleared the chat`
			: `The chat has been cleared`;

		this.#text += " for non-moderator viewers";

		return this;
	}

	/**
	 * Sets the text of the system message when the chat mode is changed for
	 * `channel.moderate` events.
	 *
	 * `{moderator} enabled/disabled {duration?} {mode} [chat]`
	 */
	public mode(
		mode: string,
		disabled: boolean,
		seconds: number,
		moderator: Viewer,
	) {
		const duration = Number.isNaN(seconds) ? "" : formatDuration(seconds);

		this.#text = "";
		this.#text += `${this.#name(moderator)} `;
		this.#text += disabled ? "disabled " : "enabled ";
		this.#text += duration;
		this.#text += mode === "slow" ? "slow mode" : `${mode} chat`;

		return this;
	}

	/**
	 * Sets the text of the system message when a user is timed out in a
	 * channel.
	 *
	 * - `{user} has been timed out for {duration}` for `CLEARCHAT` messages
	 * - `{moderator} timed out {user} for {duration}` for `channel.moderate`
	 *   events
	 */
	public timeout(seconds: number, user: Viewer, moderator?: Viewer) {
		const target = this.#name(user);
		const duration = formatDuration(seconds);

		this.#text = moderator
			? `${this.#name(moderator)} timed out ${target} for ${duration}`
			: `${target} has been timed out for ${duration}`;

		return this;
	}

	public untimeout(user: Viewer, moderator: Viewer) {
		this.#text = `${this.#name(moderator)} removed timeout on ${this.#name(user)}`;
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
