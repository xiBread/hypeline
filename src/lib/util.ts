import { clsx } from "clsx";
import type { ClassValue } from "clsx";
import dayjs from "dayjs";
import { twMerge } from "tailwind-merge";
import { settings } from "./state.svelte";

export function cn(...values: ClassValue[]) {
	return twMerge(clsx(values));
}

export function formatTime(timestamp: Date) {
	const date = dayjs(timestamp);

	let format = settings.state.timeFormat;

	if (format === "auto") {
		const locale = new Intl.Locale(navigator.language);
		// @ts-expect-error
		const cycles: string[] = locale.getHourCycles?.() ?? [];
		format = cycles.includes("h12") ? "12" : "24";
	}

	if (format === "12") {
		return date.format("h:mm A");
	}

	return date.format("HH:mm");
}
