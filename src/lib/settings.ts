import { RuneStore } from "@tauri-store/svelte";

export interface HighlightSettings {
	enabled: boolean;
}

export interface MessageHistorySettings {
	enabled: boolean;
	limit: number;
}

export interface TimestampSettings {
	show: boolean;
	format: "auto" | "12" | "24" | "custom";
	customFormat: string;
}

export interface Settings {
	// Index signature needed for RuneStore
	[key: string]: unknown;

	// Internal
	user: { id: string; token: string } | null;
	lastJoined: string | null;

	// User
	highlights: HighlightSettings;
	history: MessageHistorySettings;
	timestamps: TimestampSettings;
}

export const settings = new RuneStore<Settings>("settings", {
	user: null,
	lastJoined: null,
	highlights: {
		enabled: true,
	},
	history: {
		enabled: true,
		limit: 250,
	},
	timestamps: {
		show: true,
		format: "auto",
		customFormat: "",
	},
});
