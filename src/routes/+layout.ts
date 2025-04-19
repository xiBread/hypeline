import { invoke } from "@tauri-apps/api/core";
import { AuthUser } from "$lib/auth-user.svelte";
import type { Emote } from "$lib/channel.svelte";
import { settings } from "$lib/settings";
import { app } from "$lib/state.svelte";

export const prerender = true;
export const ssr = false;

export async function load() {
	await settings.start();

	if (settings.state.user) {
		app.user = await AuthUser.load(settings.state.user.id);
	}

	if (app.globalEmotes.size > 0) return;

	const emotes = await invoke<Emote[]>("fetch_global_emotes");

	for (const emote of emotes) {
		app.globalEmotes.set(emote.name, emote);
	}
}
