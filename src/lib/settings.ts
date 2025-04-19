import { RuneStore } from "@tauri-store/svelte";

// eslint-disable-next-line ts/consistent-type-definitions
export type Settings = {
	user: { id: string; token: string } | null;
	lastJoined: string | null;
	timeFormat: "auto" | "12" | "24";
};

export const settings = new RuneStore<Settings>("settings", {
	user: null,
	lastJoined: null,
	timeFormat: "auto",
});
