import { systemPrefersMode, userPrefersMode } from "mode-watcher";
import { fromStore } from "svelte/store";
import type { User as HelixUser } from "$lib/twitch/api";
import { invoke } from "@tauri-apps/api/core";

export class User {
	#color: string | null = null;
	readonly #data: HelixUser;

	public constructor(data: HelixUser) {
		this.#data = data;
	}

	public static async load(id: string): Promise<User> {
		const data = await invoke<HelixUser>("get_user_from_id", { id });
		const color = await invoke<string | null>("get_user_color", { id });

		const user = new User(data);
		user.setColor(color);

		return user;
	}

	public get id() {
		return this.#data.id;
	}

	public get color() {
		if (this.#color) return this.#color;

		const prefers = fromStore(userPrefersMode);
		const system = fromStore(systemPrefersMode);

		const mode =
			prefers.current === "system"
				? (system.current ?? "dark")
				: prefers.current;

		return mode === "dark" ? "#FFFFFF" : "#000000";
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
