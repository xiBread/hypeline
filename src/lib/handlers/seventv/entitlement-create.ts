import { invoke } from "@tauri-apps/api/core";
import { app } from "$lib/state.svelte";
import type { UserWithColor } from "$lib/tauri";
import { Viewer } from "$lib/viewer.svelte";
import { defineHandler } from "../helper";

export default defineHandler({
	name: "entitlement.create",
	async handle(data, channel) {
		const twitch = data.user.connections.find((c) => c.platform === "TWITCH");
		if (!twitch) return;

		// Turns out that the connection can have stale data, so we need to
		// refetch the user.
		const user = await invoke<UserWithColor | null>("get_user_from_id", { id: twitch.id });
		if (!user) return;

		let viewer = channel.viewers.get(twitch.username);

		if (!viewer) {
			viewer = new Viewer({
				id: user.data.id,
				username: user.data.login,
				displayName: user.data.display_name,
				color: user.color ?? undefined,
			});

			channel.viewers.set(viewer.username, viewer);
		}

		switch (data.kind) {
			case "BADGE": {
				viewer.badge = app.badges.get(data.ref_id);
				app.u2b.set(viewer.username, viewer.badge);

				break;
			}

			case "PAINT": {
				viewer.paint = app.paints.get(data.ref_id);
				app.u2p.set(viewer.username, viewer.paint);

				break;
			}
		}

		// console.log(viewer)
	},
});
