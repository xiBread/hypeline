import { clsx } from "clsx";
import type { ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { PartialUser } from "./user";

export type Prefix<T, P extends string> = {
	[K in keyof T as `${P}${K & string}`]: T[K];
};

// Only for syntax highlighting
export const html = String.raw;

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

export function colorizeName(user: PartialUser) {
	return html`<span class="font-semibold" style="color: ${user.color};"
		>${user.displayName}</span
	>`;
}
