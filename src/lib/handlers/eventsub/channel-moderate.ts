import { SystemMessage } from "$lib/message";
import { User } from "$lib/user.svelte";
import { defineHandler } from "../helper";

export default defineHandler({
	name: "channel.moderate",
	handle(data, channel) {
		const message = new SystemMessage();
		const moderator = User.fromModerator(data);

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

				message.setContext({
					type: "mode",
					mode,
					enabled: !data.action.includes("off"),
					seconds: Number.NaN,
					moderator,
				});

				break;
			}

			case "followers":
			case "followersoff": {
				message.setContext({
					type: "mode",
					mode: "follower-only",
					enabled: !data.action.includes("off"),
					seconds: data.followers
						? data.followers.follow_duration_minutes * 60
						: Number.NaN,
					moderator,
				});

				break;
			}

			case "slow":
			case "slowoff": {
				message.setContext({
					type: "mode",
					mode: "slow",
					enabled: data.slow !== null,
					seconds: data.slow?.wait_time_seconds ?? Number.NaN,
					moderator,
				});

				break;
			}

			case "clear": {
				channel.clearMessages();
				message.setContext({ type: "clear", moderator });

				break;
			}

			case "delete": {
				message.setContext({
					type: "delete",
					text: data.delete.message_body,
					user: User.fromBasic(data.delete),
					moderator,
				});

				break;
			}

			case "add_blocked_term":
			case "add_permitted_term":
			case "remove_blocked_term":
			case "remove_permitted_term": {
				message.setContext({ type: "term", data: data.automod_terms, moderator });
				break;
			}

			case "warn": {
				message.setContext({
					type: "warn",
					warning: data.warn,
					user: User.fromBasic(data.warn),
					moderator,
				});

				break;
			}

			case "timeout": {
				channel.clearMessages(data.timeout.user_id);

				const expiration = new Date(data.timeout.expires_at);
				const duration = expiration.getTime() - message.timestamp.getTime();

				message.setContext({
					type: "timeout",
					seconds: Math.ceil(duration / 1000),
					reason: data.timeout.reason,
					user: User.fromBasic(data.timeout),
					moderator,
				});

				break;
			}

			case "untimeout": {
				message.setContext({
					type: "untimeout",
					user: User.fromBasic(data.untimeout),
					moderator,
				});

				break;
			}

			case "ban":
			case "unban": {
				const isBan = data.action === "ban";

				if (isBan) {
					channel.clearMessages(data.ban.user_id);
				}

				message.setContext({
					type: "banStatus",
					banned: isBan,
					reason: isBan ? data.ban.reason : null,
					user: User.fromBasic(isBan ? data.ban : data.unban),
					moderator,
				});

				break;
			}

			case "mod":
			case "unmod": {
				const added = data.action === "mod";

				message.setContext({
					type: "roleStatus",
					role: "moderator",
					added,
					user: User.fromBasic(added ? data.mod : data.unmod),
					broadcaster: moderator,
				});

				break;
			}

			case "vip":
			case "unvip": {
				const added = data.action === "vip";

				message.setContext({
					type: "roleStatus",
					role: "VIP",
					added,
					user: User.fromBasic(added ? data.vip : data.unvip),
					broadcaster: moderator,
				});

				break;
			}

			case "raid": {
				message.setContext({
					type: "raid",
					viewers: data.raid.viewer_count,
					user: User.fromBasic(data.raid),
					moderator,
				});

				break;
			}

			case "unraid": {
				message.setContext({
					type: "unraid",
					user: User.fromBasic(data.unraid),
					moderator,
				});

				break;
			}

			default: {
				return;
			}
		}

		channel.addMessage(message);
	},
});
