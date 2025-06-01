import { log } from "$lib/log";
import { app } from "$lib/state.svelte";
import { User } from "$lib/user.svelte";
import { defineHandler } from "../helper";

export default defineHandler({
	name: "entitlement.create",
	async handle(data, channel) {
		const twitch = data.user.connections.find((c) => c.platform === "TWITCH");
		if (!twitch) return;

		const user = await User.from(twitch.id);
		let viewer = channel.viewers.get(user.username);

		if (!viewer) {
			viewer = user;
			channel.viewers.set(user.username, viewer);
		}

		switch (data.kind) {
			case "BADGE": {
				log.debug(`Assigned badge ${data.ref_id} to ${user.username}`);

				viewer.badge = app.badges.get(data.ref_id);
				app.u2b.set(user.username, user.badge);

				break;
			}

			case "PAINT": {
				log.debug(`Assigned paint ${data.ref_id} to ${user.username}`);

				viewer.paint = app.paints.get(data.ref_id);
				app.u2p.set(user.username, user.paint);

				break;
			}
		}
	},
});
