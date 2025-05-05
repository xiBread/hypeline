import { RuneStore } from "@tauri-store/svelte";

export interface TimestampSettings {
	show: boolean;
	format: "auto" | "12" | "24" | "custom";
	customFormat: string;
}

export interface Settings {
	// Index signature needed for RuneStore
	[key: string]: unknown;
	user: { id: string; token: string } | null;
	lastJoined: string | null;
	timestamps: TimestampSettings;
	historyEnabled: boolean;
	historyLimit: number;
}

export const settings = new RuneStore<Settings>("settings", {
	user: null,
	lastJoined: null,
	timestamps: {
		show: true,
		format: "auto",
		customFormat: "",
	},
	historyEnabled: true,
	historyLimit: 250,
});
