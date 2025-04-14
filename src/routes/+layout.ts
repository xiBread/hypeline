import { invoke } from "@tauri-apps/api/core";
import type { Emote } from "$lib/channel.svelte";
import { app, settings } from "$lib/state.svelte";

export const prerender = true;
export const ssr = false;

export async function load() {
	await settings.start();

	if (app.globalEmotes.size > 0) return;

	const emotes = await invoke<Emote[]>("fetch_global_emotes");

	for (const emote of emotes) {
		app.globalEmotes.set(emote.name, emote);
	}
}
