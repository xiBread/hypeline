import { RuneStore } from "@tauri-store/svelte";

export interface TimestampSettings {
	show: boolean;
	format: "auto" | "12" | "24" | "custom";
	customFormat: string;
}

export interface AppearanceSettings {
	timestamps: TimestampSettings;
}

export interface MessageHistorySettings {
	enabled: boolean;
	limit: number;
}

export interface ChatSettings {
	bypassDuplicate: boolean;
	mentionStyle: "none" | "colored" | "painted";
	localizedNames: boolean;
	readableColors: boolean;
	history: MessageHistorySettings;
}

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
	wholeWord: boolean;
	matchCase: boolean;
}

export interface HighlightSettings extends Record<HighlightType, HighlightTypeSettings> {
	enabled: boolean;
	custom: CustomHighlightTypeSettings[];
}

export interface Settings {
	// Index signature needed for RuneStore
	[key: string]: unknown;

	// Internal
	user: { id: string; token: string } | null;
	lastJoined: string | null;

	// User
	appearance: AppearanceSettings;
	chat: ChatSettings;
	highlights: HighlightSettings;
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
	appearance: {
		timestamps: {
			show: true,
			format: "auto",
			customFormat: "",
		},
	},
	chat: {
		bypassDuplicate: true,
		mentionStyle: "painted",
		localizedNames: true,
		readableColors: true,
		history: {
			enabled: true,
			limit: 250,
		},
	},
	highlights: {
		enabled: true,
		custom: [],
		...defaultHighlightTypes,
	},
});
