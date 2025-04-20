import { invoke } from "@tauri-apps/api/core";
import { mode } from "mode-watcher";
import type { UserWithColor } from "./tauri";
import type { User as HelixUser } from "./twitch/api";

export interface PartialUser {
	id: string;
	displayName: string;
	color: string;
}

export class User implements PartialUser {
	#color: string | null = null;
	readonly #data: HelixUser;

	public constructor(data: UserWithColor) {
		this.#data = data.data;
		this.#color = data.color;
	}

	public static async load(id: string | null): Promise<User> {
		const data = await invoke<UserWithColor>("get_user_from_id", { id });

		return new User(data);
	}

	public get id() {
		return this.#data.id;
	}

	public get color() {
		return this.#color ?? (mode.current === "dark" ? "#FFFFFF" : "#000000");
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

	public isAdmin() {
		return this.#data.type === "admin";
	}

	public isGlobalMod() {
		return this.#data.type === "global_mod";
	}

	public isStaff() {
		return this.#data.type === "staff";
	}

	public isAffiliate() {
		return this.#data.broadcaster_type === "affiliate";
	}

	public isPartner() {
		return this.#data.broadcaster_type === "partner";
	}

	public setColor(color: string | null) {
		this.#color = color;
		return this;
	}
}
