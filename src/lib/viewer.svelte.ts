import type { PartialUser } from "./user";

export class Viewer implements PartialUser {
	readonly #data: PartialUser;

	/**
	 * Whether the viewer is the broadcaster.
	 */
	public broadcaster = $state(false);

	/**
	 * Whether the viewer is a moderator in the channel.
	 */
	public moderator = $state(false);

	public constructor(data: PartialUser) {
		this.#data = data;
	}

	public get id() {
		return this.#data.id;
	}

	public get color() {
		return this.#data.color || "inherit";
	}

	public get displayName() {
		return this.#data.displayName;
	}
}
