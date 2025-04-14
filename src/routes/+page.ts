import { redirect } from "@sveltejs/kit";
import { settings } from "$lib/state.svelte";

export async function load({ parent }) {
	// Force layout to load first
	await parent();

	if (!settings.state.user) {
		return redirect(302, "/auth/login");
	}
}
