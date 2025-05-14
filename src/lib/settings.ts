import { RuneStore } from "@tauri-store/svelte";

export type HighlightType =
	| "mention"
	| "new"
	| "returning"
	| "suspicious"
	| "broadcaster"
	| "moderator"
	| "subscriber"
	| "vip";

export interface HighlightTypeSettings {
	enabled: boolean;
	color: string;
	style: "default" | "compact" | "background";
}

export interface CustomHighlightTypeSettings extends HighlightTypeSettings {
	pattern: string;
	regex: boolean;
	ignoreCase: boolean;
}

export interface HighlightSettings extends Record<HighlightType, HighlightTypeSettings> {
	enabled: boolean;
	custom: CustomHighlightTypeSettings[];
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
	coloredMentions: boolean;
	localizedNames: boolean;
	readableColors: boolean;
	highlights: HighlightSettings;
	history: MessageHistorySettings;
	timestamps: TimestampSettings;
}

export const defaultHighlightTypes: Record<HighlightType, HighlightTypeSettings> = {
	mention: { enabled: true, color: "#adadb8", style: "background" },
	new: { enabled: true, color: "#ff75e6", style: "default" },
	returning: { enabled: true, color: "#00a3a3", style: "default" },
	suspicious: { enabled: true, color: "#ff8280", style: "default" },
	broadcaster: { enabled: false, color: "#fc3430", style: "default" },
	moderator: { enabled: false, color: "#00a865", style: "default" },
	subscriber: { enabled: false, color: "#528bff", style: "default" },
	vip: { enabled: false, color: "#db00b3", style: "default" },
};

export const settings = new RuneStore<Settings>("settings", {
	user: null,
	lastJoined: null,
	coloredMentions: true,
	localizedNames: true,
	readableColors: true,
	highlights: {
		enabled: true,
		custom: [],
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
