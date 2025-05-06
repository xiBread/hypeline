import { app } from "./state.svelte";
import type { ActionMetadata } from "./twitch/eventsub";
import type { BasicUser } from "./twitch/irc";
import type { PartialUser } from "./user";

export type ViewerLike = ActionMetadata | BasicUser;

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

	public constructor(data: PartialUser) {
		this.#data = data;
	}

	public static from(data: ViewerLike, color?: string) {
		const isAction = "user_id" in data;
		let username: string;

		if (isAction) {
			username = data.user_login;
		} else {
			username = data.login;
		}

		const stored = app.active.viewers.get(username);

		return (
			stored ??
			new Viewer({
				id: isAction ? data.user_id : data.id,
				username,
				displayName: isAction ? data.user_name : data.name,
				color,
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
