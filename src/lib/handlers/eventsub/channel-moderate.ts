import { SystemMessage } from "$lib/message";
import { app } from "$lib/state.svelte";
import { Viewer } from "$lib/viewer.svelte";
import { defineHandler } from "../helper";

export default defineHandler({
	name: "channel.moderate",
	handle(data) {
		if (!app.active) return;

		const message = new SystemMessage();
		const moderator = Viewer.fromMod(data);

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

				app.active?.addMessage(
					message.mode(mode, !data.action.includes("off"), Number.NaN, moderator),
				);

				break;
			}

			case "followers":
			case "followersoff": {
				app.active?.addMessage(
					message.mode(
						"follower-only",
						!data.action.includes("off"),
						data.followers ? data.followers.follow_duration_minutes * 60 : Number.NaN,
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
						data.slow !== null,
						data.slow?.wait_time_seconds ?? Number.NaN,
						moderator,
					),
				);

				break;
			}

			case "clear": {
				app.active.clearMessages();
				app.active.addMessage(message.clear(moderator));
				break;
			}

			case "delete": {
				const target = Viewer.fromBasic(data.delete);
				app.active.addMessage(message.delete(data.delete.message_body, target, moderator));

				break;
			}

			case "add_blocked_term":
			case "add_permitted_term":
			case "remove_blocked_term":
			case "remove_permitted_term": {
				app.active.addMessage(message.term(data.automod_terms, moderator));
				break;
			}

			case "warn": {
				app.active.addMessage(message.warn(data.warn, moderator));
				break;
			}

			case "timeout": {
				app.active.clearMessages(data.timeout.user_id);

				const target = Viewer.fromBasic(data.timeout);

				const expiration = new Date(data.timeout.expires_at);
				const duration = expiration.getTime() - message.timestamp.getTime();

				app.active.addMessage(
					message.timeout(
						Math.ceil(duration / 1000),
						data.timeout.reason,
						target,
						moderator,
					),
				);

				break;
			}

			case "untimeout": {
				const target = Viewer.fromBasic(data.untimeout);
				app.active.addMessage(message.untimeout(target, moderator));

				break;
			}

			case "ban":
			case "unban": {
				const isBan = data.action === "ban";
				const target = Viewer.fromBasic(isBan ? data.ban : data.unban);

				if (isBan) {
					app.active.clearMessages(data.ban.user_id);
				}

				app.active.addMessage(
					message.banStatus(isBan, isBan ? data.ban.reason : null, target, moderator),
				);

				break;
			}

			case "mod":
			case "unmod": {
				const added = data.action === "mod";
				const target = Viewer.fromBasic(added ? data.mod : data.unmod);

				app.active.addMessage(message.roleStatus("moderator", added, target, moderator));
				break;
			}

			case "vip":
			case "unvip": {
				const added = data.action === "vip";
				const target = Viewer.fromBasic(added ? data.vip : data.unvip);

				app.active.addMessage(message.roleStatus("VIP", added, target, moderator));
				break;
			}
		}
	},
});
