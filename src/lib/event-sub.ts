import { PUBLIC_TWITCH_CLIENT_ID } from "$env/static/public";
import { createEventSubSubscription } from "./twitch-api";
import { z } from "zod";
import { settings } from "./settings.svelte";

interface EventSubMap {
	"automod.message.hold": [];
	"automod.message.update": [];
	"automod.settings.update": [];
	"automod.terms.update": [];
	"channel.ad_break.begin": [];
	"channel.bits.use": [];
	"channel.update": [];
	"channel.follow": [];
	"channel.chat.clear": [];
	"channel.chat.clear_user_messages": [];
	"channel.chat.message": {
		broadcaster_user_id: string;
		user_id: string;
	};
	"channel.chat.message_delete": [];
	"channel.chat.notification": [];
	"channel.chat_settings.update": [];
	"channel.chat.user_message_hold": [];
	"channel.chat.user_message_update": [];
	"channel.shared_chat.begin": [];
	"channel.shared_chat.update": [];
	"channel.shared_chat.end": [];
	"channel.subscribe": [];
	"channel.subscription.end": [];
	"channel.subscription.gift": [];
	"channel.subscription.message": [];
	"channel.cheer": [];
	"channel.raid": [];
	"channel.ban": [];
	"channel.unban": [];
	"channel.unban_request.create": [];
	"channel.unban_request.resolve": [];
	"channel.moderate": [];
	"channel.moderator.add": [];
	"channel.moderator.remove": [];
	// note: beta subscriptions
	// "channel.guest_star_session.begin": [];
	// "channel.guest_star_session.end": [];
	// "channel.guest_star_guest.update": [];
	// "channel.guest_star_settings.update": [];
	"channel.channel_points_automatic_reward_redemption.add": [];
	"channel.channel_points_custom_reward.add": [];
	"channel.channel_points_custom_reward.update": [];
	"channel.channel_points_custom_reward.remove": [];
	"channel.channel_points_custom_reward_redemption.add": [];
	"channel.channel_points_custom_reward_redemption.update": [];
	"channel.poll.begin": [];
	"channel.poll.progress": [];
	"channel.poll.end": [];
	"channel.prediction.begin": [];
	"channel.prediction.progress": [];
	"channel.prediction.lock": [];
	"channel.prediction.end": [];
	"channel.suspicious_user.message": [];
	"channel.suspicious_user.update": [];
	"channel.vip.add": [];
	"channel.vip.remove": [];
	"channel.warning.acknowledge": [];
	"channel.warning.send": [];
	"channel.charity_campaign.donate": [];
	"channel.charity_campaign.start": [];
	"channel.charity_campaign.progress": [];
	"channel.charity_campaign.stop": [];
	"conduit.shard.disabled": [];
	"drop.entitlement.grant": [];
	"extension.bits_transaction.create": [];
	"channel.goal.begin": [];
	"channel.goal.progress": [];
	"channel.goal.end": [];
	"channel.hype_train.begin": [];
	"channel.hype_train.progress": [];
	"channel.hype_train.end": [];
	"channel.shield_mode.begin": [];
	"channel.shield_mode.end": [];
	"channel.shoutout.create": [];
	"channel.shoutout.receive": [];
	"stream.online": [];
	"stream.offline": [];
	"user.authorization.grant": [];
	"user.authorization.revoke": [];
	"user.update": { user_id: string };
	"user.whisper.message": { user_id: string };
}

const v2Subscriptions: (keyof EventSubMap)[] = [
	"automod.message.hold",
	"automod.message.update",
	"channel.update",
	"channel.follow",
	"channel.moderate",
	"channel.channel_points_automatic_reward_redemption.add",
];

// todo: type this better
export const websocketData = z.object({
	metadata: z.object({
		message_id: z.string(),
		message_type: z.enum([
			"session_welcome",
			"session_keepalive",
			"notification",
			"session_reconnect",
			"revocation",
		]),
		message_timestamp: z.string().transform((v) => new Date(v)),
	}),
	payload: z.record(z.any()),
});

export async function subscribe<E extends keyof EventSubMap>(
	sessionId: string,
	event: E,
	condition: EventSubMap[E],
) {
	if (!settings.user) {
		throw new Error("Must be logged in to subscribe to events");
	}

	const response = await fetch(
		"https://api.twitch.tv/helix/eventsub/subscriptions",
		{
			method: "POST",
			headers: {
				Authorization: `Bearer ${settings.user.accessToken}`,
				"Client-Id": PUBLIC_TWITCH_CLIENT_ID,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				type: event,
				version: v2Subscriptions.includes(event) ? "2" : "1",
				condition,
				transport: {
					method: "websocket",
					session_id: sessionId,
				},
			}),
		},
	);

	const {
		data: [subscription],
	} = createEventSubSubscription.parse(await response.json());

	return subscription;
}
