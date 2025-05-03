import type { AutomodTermsMetadata } from "$lib/twitch/eventsub";
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
	 * Sets the text of the system message when a term is added or removed to
	 * the blocked or permitted list.
	 *
	 * `{moderator} added/removed [a] blocked/permitted term[s][ (via AutoMod)]: {term[, ]}`
	 */
	public term(data: AutomodTermsMetadata, moderator: Viewer) {
		const action = data.action === "add" ? "added" : "removed";
		const viaAutoMod = data.from_automod ? " (via AutoMod)" : "";

		this.#text = `${this.#name(moderator)} ${action} `;

		if (data.terms.length === 1) {
			this.#text += `a ${data.list} term${viaAutoMod}: ${data.terms[0]}`;
		} else {
			this.#text += `${data.terms.length} ${data.list} terms${viaAutoMod}: ${data.terms.join(", ")}`;
		}

		return this;
	}

	/**
	 * Sets the text of the system message when a user is banned or unbanned.
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
	 * Sets the text of the system message when the chat mode is changed.
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
	 * Sets the text of the system message when a user is added or removed as a
	 * moderator or VIP.
	 *
	 * `{broadcaster} added/removed {user} as a moderator/VIP`
	 */
	public roleStatus(
		role: string,
		removed: boolean,
		user: Viewer,
		broadcaster: Viewer,
	) {
		const action = removed ? "removed" : "added";
		this.#text = `${this.#name(broadcaster)} ${action} ${this.#name(user)} as a ${role}`;

		return this;
	}

	/**
	 * Sets the text of the system message when a user is timed out.
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

	/**
	 * Sets the text of the system message when a user's timeout is removed.
	 *
	 * `{moderator} removed timeout on {user}`
	 */
	public untimeout(user: Viewer, moderator: Viewer) {
		this.#text = `${this.#name(moderator)} removed timeout on ${this.#name(user)}`;
		return this;
	}

	/**
	 * Sets the text of the system message when a user is warned.
	 *
	 * `{moderator} warned {user}`
	 */
	public warn(user: Viewer, moderator: Viewer) {
		this.#text = `${this.#name(moderator)} warned ${this.#name(user)}`;
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
