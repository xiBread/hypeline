import { redirect } from "@sveltejs/kit";
import { info } from "$lib/log";
import { settings } from "$lib/settings";

export async function load({ parent }) {
	// Force layout to load first
	await parent();

	if (!settings.state.user) {
		info("User not authenticated, redirecting to login");
		return redirect(302, "/auth/login");
	}
}
