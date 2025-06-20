import { defineHandler } from "../helper";

export default defineHandler({
	name: "roomstate",
	handle(data, channel) {
		if (data.followers_only === -1) {
			channel.followerOnly = false;
		} else {
			channel.followerOnly = !!data.followers_only;
		}

		channel.emoteOnly = !!data.emote_only;
		channel.uniqueMode = !!data.unique_mode;
		channel.slowMode = data.slow_mode ?? undefined;
		channel.subOnly = !!data.subscribers_only;
	},
});
