import chroma from "chroma-js";
import { clsx } from "clsx";
import type { ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Fragment } from "./twitch/eventsub";
import type { Emote } from "./twitch/irc";
import type { PartialUser } from "./user";

export type Nullable<T> = { [K in keyof T]: T[K] | null };

export type Prefix<T, P extends string> = {
	[K in keyof T as `${P}${K & string}`]: T[K];
};

// Only for syntax highlighting
export const html = String.raw;

export function cn(...values: ClassValue[]) {
	return twMerge(clsx(values));
}

export function clamp(min: number, value: number, max: number) {
	return Math.min(Math.max(min, value), max);
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

export function extractEmotes(fragments: Fragment[]): Emote[] {
	const emotes: Emote[] = [];
	let offset = 0;

	for (const fragment of fragments) {
		const length = Array.from(fragment.text).length;

		if (fragment.type === "emote") {
			emotes.push({
				id: fragment.emote.id,
				code: fragment.text,
				range: {
					start: offset,
					end: offset + length,
				},
			});
		}

		offset += length;
	}

	return emotes;
}

const colorCache = new Map<string, string>();

export function makeReadable(foreground: string) {
	const background = getComputedStyle(document.body).backgroundColor;
	const key = `${foreground}:${background}`;

	const seen = colorCache.get(key);
	if (seen) return seen;

	const [l, c, h] = (background.match(/[\d.]+/g) ?? []).map(Number);

	let fg = chroma(foreground);
	const bg = chroma.oklch(l, c, h);
	let contrast = chroma.contrast(fg, bg);

	if (contrast >= 4.5) {
		colorCache.set(key, fg.hex());
		return fg.hex();
	}

	const lighten = bg.luminance() < 0.5;
	let i = 0;

	while (contrast < 4.5 && i < 50) {
		fg = lighten ? fg.brighten(0.1) : fg.darken(0.1);
		contrast = chroma.contrast(fg, bg);
		i++;
	}

	const adjusted = fg.hex();
	colorCache.set(key, adjusted);

	return adjusted;
}
