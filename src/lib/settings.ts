import { RuneStore } from "@tauri-store/svelte";

export interface HighlightTypeSettings {
	enabled: boolean;
	color: string;
	style: "default" | "compact" | "background";
}

export interface HighlightSettings {
	enabled: boolean;
	mention: HighlightTypeSettings;
	new: HighlightTypeSettings;
	returning: HighlightTypeSettings;
	suspicious: HighlightTypeSettings;
	broadcaster: HighlightTypeSettings;
	moderator: HighlightTypeSettings;
	subscriber: HighlightTypeSettings;
	vip: HighlightTypeSettings;
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

export const defaultHighlightTypes: Omit<HighlightSettings, "enabled"> = {
	mention: {
		enabled: true,
		color: "#adadb8",
		style: "default",
	},
	new: {
		enabled: true,
		color: "#ff75e6",
		style: "default",
	},
	returning: {
		enabled: true,
		color: "#00a3a3",
		style: "default",
	},
	suspicious: {
		enabled: true,
		color: "#ff8280",
		style: "default",
	},
	broadcaster: {
		enabled: false,
		color: "#fc3430",
		style: "default",
	},
	moderator: {
		enabled: false,
		color: "#00a865",
		style: "default",
	},
	subscriber: {
		enabled: false,
		color: "#528bff",
		style: "default",
	},
	vip: {
		enabled: false,
		color: "#db00b3",
		style: "default",
	},
};

export const settings = new RuneStore<Settings>("settings", {
	user: null,
	lastJoined: null,
	highlights: {
		enabled: true,
		...defaultHighlightTypes,
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
