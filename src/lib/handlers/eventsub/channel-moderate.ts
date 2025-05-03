import { SystemMessage } from "$lib/message";
import { app } from "$lib/state.svelte";
import { Viewer } from "$lib/viewer.svelte";
import { defineHandler } from "../helper";

export default defineHandler({
	name: "channel.moderate",
	handle(data) {
		const message = new SystemMessage();

		let moderator = app.active.viewers.get(data.moderator_user_login);
		moderator ??= new Viewer({
			id: data.moderator_user_id,
			username: data.moderator_user_login,
			displayName: data.moderator_user_name,
		});

		switch (data.action) {
			case "emoteonly":
			case "emoteonlyoff":
			case "subscribers":
			case "subscribersoff":
			case "uniquechat":
			case "uniquechatoff": {
				const mode = data.action.startsWith("emote")
					? "emote-only"
					: data.action.startsWith("unique")
						? "unique-mode"
						: "subscriber-only";

				app.active.addMessage(
					message.mode(
						mode,
						data.action.includes("off"),
						Number.NaN,
						moderator,
					),
				);

				break;
			}

			case "followers":
			case "followersoff": {
				app.active.addMessage(
					message.mode(
						"follower-only",
						data.action.includes("off"),
						data.followers
							? data.followers.follow_duration_minutes * 60
							: Number.NaN,
						moderator,
					),
				);

				break;
			}

			case "slow":
			case "slowoff": {
				app.active.addMessage(
					message.mode(
						"slow",
						!data.slow,
						data.slow?.wait_time_seconds ?? Number.NaN,
						moderator,
					),
				);

				break;
			}

			case "ban":
			case "unban": {
				const isBan = data.action === "ban";
				const target = Viewer.from(isBan ? data.ban : data.unban);

				app.active.addMessage(
					message.banStatus(!isBan, target, moderator),
				);

				break;
			}

			case "clear": {
				app.active.addMessage(message.clear(moderator));
				break;
			}

			case "timeout": {
				const target = Viewer.from(data.timeout);

				const expiration = new Date(data.timeout.expires_at);
				const duration =
					expiration.getTime() - message.timestamp.getTime();

				app.active.addMessage(
					message.timeout(
						Math.ceil(duration / 1000),
						target,
						moderator,
					),
				);

				break;
			}

			case "untimeout": {
				const target = Viewer.from(data.untimeout);

				app.active.addMessage(message.untimeout(target, moderator));
				break;
			}
		}
	},
});
