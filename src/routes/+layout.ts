import { invoke } from "@tauri-apps/api/core";
import { settings } from "$lib/settings";
import { app } from "$lib/state.svelte";
import type { Emote } from "$lib/tauri";
import type { Badge, BadgeSet } from "$lib/twitch/api";
import { User } from "$lib/user";

export const prerender = true;
export const ssr = false;

export async function load() {
	await settings.start();
	if (!settings.state.user) return;

	app.user = await User.from(settings.state.user.id);

	if (settings.state.lastJoined?.startsWith("ephemeral:")) {
		settings.state.lastJoined = null;
	}

	if (!app.globalEmotes.size) {
		const emotes = await invoke<Emote[]>("fetch_global_emotes");

		for (const emote of emotes) {
			app.globalEmotes.set(emote.name, emote);
		}
	}

	if (!app.globalBadges.size) {
		const badges = await invoke<BadgeSet[]>("fetch_global_badges");

		for (const set of badges) {
			const badges: Record<string, Badge> = {};

			for (const version of set.versions) {
				badges[version.id] = version;
			}

			app.globalBadges.set(set.set_id, badges);
		}
	}
}
