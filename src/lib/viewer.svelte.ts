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

	public get id() {
		return this.#data.id;
	}

	public get color() {
		return this.#data.color || "inherit";
	}

	public get username() {
		return this.#data.username;
	}

	public get displayName() {
		return this.#data.displayName;
	}
}
