import type { User } from "$lib/types";
import { Store } from "@tauri-apps/plugin-store";

export const prerender = true;
export const ssr = false;

export async function load() {
	const settings = await Store.load("settings.json");
	const user = await settings.get<User>("user");

	return {
		user,
		settings,
	};
}
