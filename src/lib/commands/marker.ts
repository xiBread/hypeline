import { invoke } from "@tauri-apps/api/core";
import dayjs from "dayjs";
import { SystemMessage } from "$lib/message";
import type { StreamMarker } from "$lib/twitch/api";
import { defineCommand } from "./util";

export default defineCommand({
	name: "marker",
	description: "Add a stream marker at the current timestamp",
	modOnly: true,
	args: ["description"],
	async exec(args, channel) {
		const description = args.join(" ");

		if (!channel.stream) {
			channel.error = "Markers can only be created when the channel is live.";
			return;
		}

		if (description.length > 140) {
			channel.error = "Marker description must be 140 characters or less.";
			return;
		}

		const marker = await invoke<StreamMarker>("create_marker", {
			broadcasterId: channel.user.id,
			description,
		});

		const duration = dayjs.duration(marker.position_seconds, "s");
		const format = duration.asHours() > 0 ? "H[h] mm[m] ss[s]" : "mm[m] ss[s]";

		const message = new SystemMessage();
		const echo = description ? `: ${description}` : "";

		message.setText(`Stream marker created at ${duration.format(format) + echo}`);

		channel.addMessage(message);
	},
});
