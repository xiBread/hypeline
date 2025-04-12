/* eslint-disable ts/no-redeclare */

import { z } from "zod";

export const ChannelChatMessage = z.object({
	broadcaster_user_id: z.string(),
	broadcaster_user_name: z.string(),
	broadcaster_user_login: z.string(),
	chatter_user_id: z.string(),
	chatter_user_name: z.string(),
	chatter_user_login: z.string(),
	message_id: z.string(),
	message: z.object({
		text: z.string(),
		fragments: z
			.discriminatedUnion([
				z.object({ type: z.literal("text"), text: z.string() }),
				z.object({
					type: z.literal("cheermote"),
					text: z.string(),
					cheermote: z.object({
						prefix: z.string(),
						bits: z.number(),
						tier: z.number(),
					}),
				}),
				z.object({
					type: z.literal("emote"),
					text: z.string(),
					emote: z.object({
						id: z.string(),
						emote_set_id: z.string(),
						owner_id: z.string(),
						format: z.enum(["static", "animated"]).array(),
					}),
				}),
				z.object({
					type: z.literal("mention"),
					text: z.string(),
					mention: z.object({
						user_id: z.string(),
						user_name: z.string(),
						user_login: z.string(),
					}),
				}),
			])
			.array(),
	}),
	message_type: z.enum([
		"text",
		"channel_points_highlighted",
		"channel_points_sub_only",
		"user_intro",
		"power_ups_message_effect",
		"power_ups_gigantified_emote",
	]),
	badges: z
		.object({
			set_id: z.string(),
			id: z.string(),
			info: z.string(),
		})
		.array(),
	cheer: z.object({ bits: z.number() }).or(z.null()),
	color: z.string(),
	reply: z
		.object({
			parent_message_id: z.string(),
			parent_message_body: z.string(),
			parent_user_id: z.string(),
			parent_user_name: z.string(),
			parent_user_login: z.string(),
			thread_message_id: z.string(),
			thread_user_id: z.string(),
			thread_user_name: z.string(),
			thread_user_login: z.string(),
		})
		.or(z.null()),
	channel_points_custom_reward_id: z.string().or(z.null()),
	source_broadcaster_user_id: z.string().or(z.null()),
	source_broadcaster_user_name: z.string().or(z.null()),
	source_broadcaster_user_login: z.string().or(z.null()),
	source_message_id: z.string().or(z.null()),
	source_badges: z
		.object({
			set_id: z.string(),
			id: z.string(),
			info: z.string(),
		})
		.array()
		.or(z.null()),
});

export type ChannelChatMessage = z.infer<typeof ChannelChatMessage>;

export const UserUpdate = z.object({
	user_id: z.string(),
	user_login: z.string(),
	user_name: z.string(),
	description: z.string(),
});

export type UserUpdate = z.infer<typeof UserUpdate>;
