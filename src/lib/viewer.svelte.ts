import { app } from "./state.svelte";
import type { ActionMetadata } from "./twitch/eventsub";
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

	public constructor(data: PartialUser) {
		this.#data = data;
	}

	public static from(metadata: ActionMetadata) {
		const stored = app.active.viewers.get(metadata.user_login);

		return (
			stored ??
			new Viewer({
				id: metadata.user_id,
				username: metadata.user_login,
				displayName: metadata.user_name,
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
