import type {
	AutomodTermsMetadata,
	UnbanRequestMetadata,
	WarnMetadata,
} from "$lib/twitch/eventsub";
import { colorizeName, formatDuration } from "$lib/util";
import { Viewer } from "$lib/viewer.svelte";
import { Message } from "./message.svelte";

export interface SystemMessageData {
	deleted: boolean;
	is_recent: boolean;
	server_timestamp: number;
}

/**
 * System messages are messages constructed internally and sent to relay
 * information to the user.
 */
export class SystemMessage extends Message {
	#id = crypto.randomUUID();
	#text = "";

	public constructor(data: Partial<SystemMessageData> = {}) {
		const prepared: SystemMessageData = {
			deleted: data.deleted ?? false,
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

		return message.setText(`Joined ${colorizeName(channel)}`);
	}

	public override get id() {
		return this.#id;
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
		const target = colorizeName(user);
		const action = banned ? "banned" : "unbanned";

		this.#text = moderator
			? `${colorizeName(moderator)} ${action} ${target}.`
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
			? `${colorizeName(moderator)} cleared the chat`
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
		this.#text += `${colorizeName(moderator)} ${action} ${duration}`;
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
		this.#text = `${colorizeName(broadcaster)} ${action} ${colorizeName(user)} as a ${role}.`;

		return this;
	}

	/**
	 * Sets the text of the system message when a stream goes online or offline.
	 *
	 * `{broadcaster} is now online/offline`
	 */
	public streamStatus(online: boolean, broadcaster: Viewer) {
		const status = online ? "online" : "offline";
		this.#text = `${colorizeName(broadcaster)} is now ${status}.`;

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

		this.#text = `${colorizeName(moderator)} ${action} `;

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
		const target = colorizeName(user);
		const duration = formatDuration(seconds);

		this.#text = moderator
			? `${colorizeName(moderator)} timed out ${target} for ${duration}.`
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
		const user = Viewer.fromBasic(request);
		const action = request.is_approved ? "approved" : "denied";

		this.#text = `${colorizeName(moderator)} ${action} ${colorizeName(user)}'s unban request.`;
		return this;
	}

	/**
	 * Sets the text of the system message when a user's timeout is removed.
	 *
	 * `{moderator} removed timeout on {user}`
	 */
	public untimeout(user: Viewer, moderator: Viewer) {
		this.#text = `${colorizeName(moderator)} removed timeout on ${colorizeName(user)}.`;
		return this;
	}

	/**
	 * Sets the text of the system message when a user is warned.
	 *
	 * `{moderator} warned {user}[: {reason[, ]}]`
	 */
	public warn(warning: WarnMetadata, moderator: Viewer) {
		const user = Viewer.fromBasic(warning);
		this.#text = `${colorizeName(moderator)} warned ${colorizeName(user)}.`;

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

	/**
	 * Sets the text of the system message when a user acknowledges their
	 * warning.
	 *
	 * `{user} acknowledged their warning`
	 */
	public warnAck(user: Viewer) {
		this.#text = `${colorizeName(user)} acknowledged their warning.`;
		return this;
	}

	public setText(text: string) {
		this.#text = text;
		return this;
	}
}
