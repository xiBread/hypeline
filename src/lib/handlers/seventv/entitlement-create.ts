import { log } from "$lib/log";
import { app } from "$lib/state.svelte";
import { User } from "$lib/user.svelte";
import { defineHandler } from "../helper";

export default defineHandler({
	name: "entitlement.create",
	async handle(data) {
		const twitch = data.user.connections.find((c) => c.platform === "TWITCH");
		if (!twitch) return;

		const user = await User.from(twitch.id);

		switch (data.kind) {
			case "BADGE": {
				log.debug(`Assigned badge ${data.ref_id} to ${user.username}`);

				user.badge = app.badges.get(data.ref_id);
				app.u2b.set(user.id, user.badge);

				break;
			}

			case "PAINT": {
				log.debug(`Assigned paint ${data.ref_id} to ${user.username}`);

				user.paint = app.paints.get(data.ref_id);
				app.u2p.set(user.id, user.paint);

				break;
			}
		}
	},
});
