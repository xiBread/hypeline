import { invoke } from "@tauri-apps/api/core";
import type { Emote } from "$lib/channel.svelte";
import { settings } from "$lib/settings";
import { app } from "$lib/state.svelte";
import { User } from "$lib/user";

export const prerender = true;
export const ssr = false;

export async function load() {
	await settings.start();

	if (settings.state.user) {
		app.user = await User.load(settings.state.user.id);
	}

	if (app.globalEmotes.size > 0) return;

	const emotes = await invoke<Emote[]>("fetch_global_emotes");

	for (const emote of emotes) {
		app.globalEmotes.set(emote.name, emote);
	}
}
