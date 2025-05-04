import type {
	AutomodTermsMetadata,
	UnbanRequestMetadata,
	WarnMetadata,
} from "$lib/twitch/eventsub";
import type { PartialUser } from "$lib/user";
import { formatDuration } from "$lib/util";
import { Viewer } from "$lib/viewer.svelte";
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
	 * Sets the text of the system message when a user is banned or unbanned.
	 *
	 * - `{user} has been banned/unbanned` for `CLEARCHAT` messages
	 * - `{moderator} banned/unbanned {user}[: {reason}]` for `channel.moderate` events
	 */
	public banStatus(
		banned: boolean,
		reason: string | null,
		user: Viewer,
		moderator?: Viewer,
	) {
		const target = this.#name(user);
		const action = banned ? "banned" : "unbanned";

		this.#text = moderator
			? `${this.#name(moderator)} ${action} ${target}.`
			: `${target} has been ${action}.`;

		if (reason) {
			this.#text = `${this.#text.slice(0, -1)}: ${reason}`;
		}

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

		this.#text += " for non-moderator viewers.";

		return this;
	}

	/**
	 * Sets the text of the system message when the chat mode is changed.
	 *
	 * `{moderator} enabled/disabled {duration?} {mode} [chat]`
	 */
	public mode(
		mode: string,
		enabled: boolean,
		seconds: number,
		moderator: Viewer,
	) {
		const action = enabled ? "enabled" : "disabled";
		const duration = Number.isNaN(seconds) ? "" : formatDuration(seconds);

		this.#text = "";
		this.#text += `${this.#name(moderator)} ${action} ${duration}`;
		this.#text += mode === "slow" ? "slow mode." : `${mode} chat.`;

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
		added: boolean,
		user: Viewer,
		broadcaster: Viewer,
	) {
		const action = added ? "added" : "removed";
		this.#text = `${this.#name(broadcaster)} ${action} ${this.#name(user)} as a ${role}.`;

		return this;
	}

	/**
	 * Sets the text of the system message when a term is added or removed to
	 * the blocked or permitted list.
	 *
	 * `{moderator} added/removed [a] blocked/permitted term[s][ (via AutoMod)]: {term[, ]}`
	 */
	public term(data: AutomodTermsMetadata, moderator: Viewer) {
		const action = data.action === "add" ? "added" : "removed";
		const via = data.from_automod ? " (via AutoMod)" : "";

		this.#text = `${this.#name(moderator)} ${action} `;

		if (data.terms.length === 1) {
			this.#text += `a ${data.list} term${via}: ${data.terms[0]}`;
		} else {
			this.#text += `${data.terms.length} ${data.list} terms${via}: ${data.terms.join(", ")}`;
		}

		return this;
	}

	/**
	 * Sets the text of the system message when a user is timed out.
	 *
	 * - `{user} has been timed out for {duration}` for `CLEARCHAT` messages
	 * - `{moderator} timed out {user} for {duration}[: {reason}]` for
	 *   `channel.moderate` events
	 */
	public timeout(
		seconds: number,
		reason: string | null,
		user: Viewer,
		moderator?: Viewer,
	) {
		const target = this.#name(user);
		const duration = formatDuration(seconds);

		this.#text = moderator
			? `${this.#name(moderator)} timed out ${target} for ${duration}.`
			: `${target} has been timed out for ${duration}.`;

		if (reason) {
			this.#text = `${this.#text.slice(0, -1)}: ${reason}`;
		}

		return this;
	}

	/**
	 * Sets the text of the system message when a user's unban request is
	 * approved or denied.
	 *
	 * `{moderator} approved/denied {user}'s unban request`
	 */
	public unbanRequest(request: UnbanRequestMetadata, moderator: Viewer) {
		const user = Viewer.from(request);
		const action = request.is_approved ? "approved" : "denied";

		this.#text = `${this.#name(moderator)} ${action} ${this.#name(user)}'s unban request.`;
		return this;
	}

	/**
	 * Sets the text of the system message when a user's timeout is removed.
	 *
	 * `{moderator} removed timeout on {user}`
	 */
	public untimeout(user: Viewer, moderator: Viewer) {
		this.#text = `${this.#name(moderator)} removed timeout on ${this.#name(user)}.`;
		return this;
	}

	/**
	 * Sets the text of the system message when a user is warned.
	 *
	 * `{moderator} warned {user}[: {reason[, ]}]`
	 */
	public warn(warning: WarnMetadata, moderator: Viewer) {
		const user = Viewer.from(warning);
		this.#text = `${this.#name(moderator)} warned ${this.#name(user)}.`;

		if (warning.reason || warning.chat_rules_cited) {
			const reasons = [
				warning.reason,
				...(warning.chat_rules_cited ?? []),
			]
				.filter((r) => r !== null)
				.join(", ");

			this.#text = `${this.#text.slice(0, -1)}: ${reasons}`;
		}

		return this;
	}

	#name(user: PartialUser) {
		return html`<span class="font-semibold" style="color: ${user.color};"
			>${user.displayName}</span
		>`;
	}

	public setText(text: string) {
		this.#text = text;
		return this;
	}
}
