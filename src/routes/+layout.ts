import { LazyStore } from "@tauri-apps/plugin-store";

export const prerender = true;
export const ssr = false;

export function load() {
	return {
		settingsStore: new LazyStore("settings.json"),
	};
}
