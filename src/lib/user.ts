import { invoke } from "@tauri-apps/api/core";
import { SvelteSet } from "svelte/reactivity";
import type { UserWithColor } from "./tauri";
import type { User as HelixUser } from "./twitch/api";

export interface PartialUser {
	id: string;
	color: string;
	username: string;
	displayName: string;
}

export class User implements PartialUser {
	readonly #data: HelixUser;
	#color: string | null = null;

	/**
	 * A set of channel ids that the user is a moderator in.
	 */
	public readonly moderating = new SvelteSet<string>();

	public constructor(data: UserWithColor) {
		this.#data = data.data;
		this.#color = data.color;

		this.moderating.add(this.id);
	}

	public static async from(id: string | null = null): Promise<User> {
		const data = await invoke<UserWithColor>("get_user_from_id", { id });
		const user = new User(data);

		const channels = await invoke<string[]>("get_moderated_channels");
		channels.forEach((id) => user.moderating.add(id));

		return user;
	}

	public get id() {
		return this.#data.id;
	}

	/**
	 * The color of the user's name. Defaults to the current foreground color
	 * if the user doesn't have a color set.
	 */
	public get color() {
		return this.#color ?? "inherit";
	}

	/**
	 * The lowercase value of the user's name.
	 */
	public get username() {
		return this.#data.login;
	}

	/**
	 * The custom value of the user's name. This will be the same as the
	 * {@linkcode username}, but it may have different capitalization.
	 */
	public get displayName() {
		return this.#data.display_name;
	}

	public get description() {
		return this.#data.description;
	}

	public get profilePictureUrl() {
		return this.#data.profile_image_url;
	}

	public get bannerUrl() {
		return this.#data.offline_image_url;
	}

	public get createdAt() {
		return new Date(this.#data.created_at);
	}

	/**
	 * Whether the user is Twitch staff.
	 */
	public get staff() {
		return this.#data.type === "staff";
	}

	/**
	 * Whether the user is a Twitch affiliate.
	 */
	public get affiliate() {
		return this.#data.broadcaster_type === "affiliate";
	}

	/**
	 * Whether the user is a Twitch partner.
	 */
	public get partner() {
		return this.#data.broadcaster_type === "partner";
	}

	public setColor(color: string | null) {
		this.#color = color;
		return this;
	}
}
