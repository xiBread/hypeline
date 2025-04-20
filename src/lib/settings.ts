import { RuneStore } from "@tauri-store/svelte";

export interface Settings {
	// Index signature needed for RuneStore
	[key: string]: unknown;
	user: { id: string; token: string } | null;
	lastJoined: string | null;
	timeFormat: "auto" | "12" | "24";
}

export const settings = new RuneStore<Settings>("settings", {
	user: null,
	lastJoined: null,
	timeFormat: "auto",
});
