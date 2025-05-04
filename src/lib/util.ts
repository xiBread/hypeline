import { clsx } from "clsx";
import type { ClassValue } from "clsx";
import dayjs from "dayjs";
import { twMerge } from "tailwind-merge";
import { settings } from "./settings";

export function cn(...values: ClassValue[]) {
	return twMerge(clsx(values));
}

export function formatDuration(seconds: number) {
	const parts: string[] = [];

	const days = Math.floor(seconds / 86400);
	if (days) {
		parts.push(`${days}d`);
		seconds %= 86400;
	}

	const hours = Math.floor(seconds / 3600);
	if (hours) {
		parts.push(`${hours}h`);
		seconds %= 3600;
	}

	const minutes = Math.floor(seconds / 60);
	if (minutes) {
		parts.push(`${minutes}m`);
		seconds %= 60;
	}

	if (seconds || !parts.length) {
		parts.push(`${seconds}s`);
	}

	return parts.join(" ");
}

export function formatTime(timestamp: Date) {
	const date = dayjs(timestamp);

	let format = settings.state.timeFormat;

	if (format === "auto") {
		const locale = new Intl.Locale(navigator.language);
		// @ts-expect-error - limited support
		const cycles: string[] = locale.getHourCycles?.() ?? [];
		format = cycles.includes("h12") ? "12" : "24";
	}

	if (format === "12") {
		return date.format("h:mm A");
	}

	return date.format("HH:mm");
}
