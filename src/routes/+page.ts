import { redirect } from "@sveltejs/kit";
import { settings } from "$lib/state.svelte";

export async function load() {
	await settings.start();

	if (!settings.state.user) {
		return redirect(302, "/auth/login");
	}
}
