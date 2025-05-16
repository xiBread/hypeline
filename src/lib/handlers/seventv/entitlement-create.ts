import { app } from "$lib/state.svelte";
import { Viewer } from "$lib/viewer.svelte";
import { defineHandler } from "../helper";

function toHex(decimal: number) {
	return `#${((decimal >>> 0) & 0xffffff).toString(16).padStart(6, "0")}`;
}

export default defineHandler({
	name: "entitlement.create",
	handle(data, channel) {
		const twitch = data.user.connections.find((c) => c.platform === "TWITCH");
		if (!twitch) return;

		let viewer = channel.viewers.get(twitch.username);

		if (!viewer) {
			viewer = new Viewer({
				id: twitch.id,
				username: twitch.username,
				displayName: twitch.display_name,
				color: toHex(data.user.style.color),
			});

			channel.viewers.set(twitch.username, viewer);
		}

		switch (data.kind) {
			case "BADGE": {
				viewer.badge = app.badges.get(data.ref_id);
				break;
			}

			case "PAINT": {
				viewer.paint = app.paints.get(data.ref_id);
				break;
			}
		}
	},
});
