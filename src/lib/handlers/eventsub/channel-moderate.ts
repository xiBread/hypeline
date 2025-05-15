import { SystemMessage } from "$lib/message";
import { Viewer } from "$lib/viewer.svelte";
import { defineHandler } from "../helper";

export default defineHandler({
	name: "channel.moderate",
	handle(data, channel) {
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

				channel.addMessage(
					message.setContext({
						type: "mode",
						mode,
						enabled: !data.action.includes("off"),
						seconds: Number.NaN,
						moderator,
					}),
				);

				break;
			}

			case "followers":
			case "followersoff": {
				channel.addMessage(
					message.setContext({
						type: "mode",
						mode: "follower-only",
						enabled: !data.action.includes("off"),
						seconds: data.followers
							? data.followers.follow_duration_minutes * 60
							: Number.NaN,
						moderator,
					}),
				);

				break;
			}

			case "slow":
			case "slowoff": {
				channel.addMessage(
					message.setContext({
						type: "mode",
						mode: "slow",
						enabled: data.slow !== null,
						seconds: data.slow?.wait_time_seconds ?? Number.NaN,
						moderator,
					}),
				);

				break;
			}

			case "clear": {
				channel.clearMessages();
				channel.addMessage(message.setContext({ type: "clear", moderator }));
				break;
			}

			case "delete": {
				channel.addMessage(
					message.setContext({
						type: "delete",
						text: data.delete.message_body,
						user: Viewer.fromBasic(data.delete),
						moderator,
					}),
				);

				break;
			}

			case "add_blocked_term":
			case "add_permitted_term":
			case "remove_blocked_term":
			case "remove_permitted_term": {
				channel.addMessage(
					message.setContext({ type: "term", data: data.automod_terms, moderator }),
				);

				break;
			}

			case "warn": {
				channel.addMessage(
					message.setContext({
						type: "warn",
						warning: data.warn,
						user: Viewer.fromBasic(data.warn),
						moderator,
					}),
				);

				break;
			}

			case "timeout": {
				channel.clearMessages(data.timeout.user_id);

				const expiration = new Date(data.timeout.expires_at);
				const duration = expiration.getTime() - message.timestamp.getTime();

				channel.addMessage(
					message.setContext({
						type: "timeout",
						seconds: Math.ceil(duration / 1000),
						reason: data.timeout.reason,
						user: Viewer.fromBasic(data.timeout),
						moderator,
					}),
				);

				break;
			}

			case "untimeout": {
				channel.addMessage(
					message.setContext({
						type: "untimeout",
						user: Viewer.fromBasic(data.untimeout),
						moderator,
					}),
				);

				break;
			}

			case "ban":
			case "unban": {
				const isBan = data.action === "ban";

				if (isBan) {
					channel.clearMessages(data.ban.user_id);
				}

				channel.addMessage(
					message.setContext({
						type: "banStatus",
						banned: isBan,
						reason: isBan ? data.ban.reason : null,
						user: Viewer.fromBasic(isBan ? data.ban : data.unban),
						moderator,
					}),
				);

				break;
			}

			case "mod":
			case "unmod": {
				const added = data.action === "mod";

				channel.addMessage(
					message.setContext({
						type: "roleStatus",
						role: "moderator",
						added,
						user: Viewer.fromBasic(added ? data.mod : data.unmod),
						broadcaster: moderator,
					}),
				);

				break;
			}

			case "vip":
			case "unvip": {
				const added = data.action === "vip";

				channel.addMessage(
					message.setContext({
						type: "roleStatus",
						role: "VIP",
						added,
						user: Viewer.fromBasic(added ? data.vip : data.unvip),
						broadcaster: moderator,
					}),
				);

				break;
			}
		}
	},
});
