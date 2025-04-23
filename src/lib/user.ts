import { invoke } from "@tauri-apps/api/core";
import { SvelteSet } from "svelte/reactivity";
import type { UserWithColor } from "./tauri";
import type { User as HelixUser } from "./twitch/api";

export interface PartialUser {
	id: string;
	displayName: string;
	color: string;
}
export interface ChatUser extends PartialUser {
	broadcaster: boolean;
	mod: boolean;
}

export class User implements PartialUser {
	readonly #data: HelixUser;
	#color: string | null = null;

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

	public get color() {
		return this.#color ?? "inherit";
	}

	public get username() {
		return this.#data.login;
	}

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

	public get admin() {
		return this.#data.type === "admin";
	}

	public get globalMod() {
		return this.#data.type === "global_mod";
	}

	public get staff() {
		return this.#data.type === "staff";
	}

	public get affiliate() {
		return this.#data.broadcaster_type === "affiliate";
	}

	public get partner() {
		return this.#data.broadcaster_type === "partner";
	}

	public setColor(color: string | null) {
		this.#color = color;
		return this;
	}
}
