import { redirect } from "@sveltejs/kit";
import { log } from "$lib/log";
import { settings } from "$lib/settings";

export async function load({ parent }) {
	// Force layout to load first
	await parent();

	if (!settings.state.user) {
		log.info("User not authenticated, redirecting to login");
		return redirect(302, "/auth/login");
	}
}
