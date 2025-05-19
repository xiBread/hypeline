import { settings } from "./settings";
import type { Paint } from "./seventv";
import { app } from "./state.svelte";
import type { UserWithColor } from "./tauri";
import type { Badge } from "./twitch/api";
import type {
	BanEvasionEvaluation,
	WithBasicUser,
	WithBroadcaster,
	WithModerator,
} from "./twitch/eventsub";
import type { BasicUser } from "./twitch/irc";
import type { PartialUser } from "./user";
import { makeReadable } from "./util";

export class Viewer implements PartialUser {
	readonly #data: PartialUser;

	/**
	 * Whether the viewer is the broadcaster.
	 */
	public isBroadcaster = $state(false);

	/**
	 * Whether the viewer is a moderator in the channel.
	 */
	public isMod = $state(false);

	/**
	 * Whether the viewer is a subscriber to the channel.
	 */
	public isSub = $state(false);

	/**
	 * Whether the viewer is a VIP in the channel.
	 */
	public isVip = $state(false);

	/**
	 * Whether the viewer is a returning user to the channel.
	 *
	 * Returning users are new viewers who have chatted at least twice in the
	 * last 30 days.
	 */
	public isReturning = $state(false);

	/**
	 * Whether the viewer's messages are being monitored. This is mutually
	 * exclusive with `restricted`.
	 */
	public monitored = $state(false);

	/**
	 * Whether the viewer's messages are being restricted. This is mutually
	 * exclusive with `monitored`.
	 */
	public restricted = $state(false);

	/**
	 * The likelihood that the viewer is ban evading if they are considered a
	 * suspicious user.
	 */
	public banEvasion = $state<BanEvasionEvaluation>("unknown");

	public badge = $state<Badge>();
	public paint = $state<Paint>();

	public constructor(data: PartialUser) {
		this.#data = data;
	}

	public static from(data: BasicUser, color?: string) {
		const stored = app.joined?.viewers.get(data.login);

		return (
			stored ??
			new Viewer({
				id: data.id,
				username: data.login,
				displayName: data.name,
				color,
			})
		);
	}

	public static fromBasic(data: WithBasicUser) {
		let stored = app.joined?.viewers.get(data.user_login);

		if (!stored) {
			stored = new Viewer({
				id: data.user_id,
				username: data.user_login,
				displayName: data.user_name,
			});

			app.joined?.viewers.set(data.user_login, stored);
		}

		return stored;
	}

	public static fromBroadcaster(data: WithBroadcaster) {
		const stored = app.joined?.viewers.get(data.broadcaster_user_login);

		return (
			stored ??
			new Viewer({
				id: data.broadcaster_user_id,
				username: data.broadcaster_user_login,
				displayName: data.broadcaster_user_name,
			})
		);
	}

	public static fromMod(data: WithModerator) {
		const stored = app.joined?.viewers.get(data.moderator_user_login);

		return (
			stored ??
			new Viewer({
				id: data.moderator_user_id,
				username: data.moderator_user_login,
				displayName: data.moderator_user_name,
			})
		);
	}

	public static fromTwitch(user: UserWithColor) {
		let stored = app.joined?.viewers.get(user.data.login);

		if (!stored) {
			stored = new Viewer({
				id: user.data.id,
				username: user.data.login,
				displayName: user.data.display_name,
				color: user.color ?? undefined,
			});

			app.joined?.viewers.set(user.data.login, stored);
		}

		return stored;
	}

	public get id() {
		return this.#data.id;
	}

	public get color() {
		if (this.#data.color && settings.state.readableColors) {
			return makeReadable(this.#data.color);
		}

		return this.#data.color ?? "inherit";
	}

	public get style() {
		const color = `color: ${this.color};`;

		return this.paint ? `${this.paint.css}; ${color};` : color;
	}

	public get username() {
		return this.#data.username;
	}

	public get displayName() {
		if (this.#data.username !== this.#data.displayName.toLowerCase()) {
			if (settings.state.localizedNames) {
				return `${this.#data.displayName} (${this.username})`;
			}

			return this.username;
		}

		return this.#data.displayName;
	}

	public get isSuspicious() {
		return this.monitored || this.restricted || this.banEvasion !== "unknown";
	}
}
