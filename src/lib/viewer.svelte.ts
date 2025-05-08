import { app } from "./state.svelte";
import type {
	WithBasicUser,
	WithBroadcaster,
	WithModerator,
} from "./twitch/eventsub";
import type { BasicUser } from "./twitch/irc";
import type { PartialUser } from "./user";

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

	public constructor(data: PartialUser) {
		this.#data = data;
	}

	public static from(data: BasicUser, color?: string) {
		const stored = app.active.viewers.get(data.login);

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
		const stored = app.active.viewers.get(data.user_login);

		return (
			stored ??
			new Viewer({
				id: data.user_id,
				username: data.user_login,
				displayName: data.user_name,
			})
		);
	}

	public static fromBroadcaster(data: WithBroadcaster) {
		const stored = app.active.viewers.get(data.broadcaster_user_login);

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
		const stored = app.active.viewers.get(data.moderator_user_login);

		return (
			stored ??
			new Viewer({
				id: data.moderator_user_id,
				username: data.moderator_user_login,
				displayName: data.moderator_user_name,
			})
		);
	}

	public get id() {
		return this.#data.id;
	}

	public get color() {
		return this.#data.color ?? "inherit";
	}

	public get username() {
		return this.#data.username;
	}

	public get displayName() {
		return this.#data.displayName;
	}
}
