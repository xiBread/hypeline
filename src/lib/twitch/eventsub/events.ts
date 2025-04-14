export interface TextFragment {
	type: "text";
	text: string;
}

export interface Cheermote {
	prefix: string;
	bits: number;
	tier: number;
}

export interface CheermoteFragment {
	type: "cheermote";
	text: string;
	cheermote: Cheermote;
}

export interface Emote {
	text: string;
	id: string;
	emote_set_id: string;
	owner_id: string;
	format: ("static" | "animated")[];
}

export interface EmoteFragment {
	type: "emote";
	text: string;
	emote: Emote;
}

export interface Mention {
	user_id: string;
	user_name: string;
	user_login: string;
}

export interface MentionFragment {
	type: "mention";
	text: string;
	mention: Mention;
}

export type MessageFragment =
	| TextFragment
	| CheermoteFragment
	| EmoteFragment
	| MentionFragment;

export interface StructuredMessage {
	text: string;
	fragments: MessageFragment[];
}

export type MessageType =
	| "text"
	| "channel_points_highlighted"
	| "channel_points_sub_only"
	| "user_intro"
	| "power_ups_message_effect"
	| "power_ups_gigantified_emote";

export interface Badge {
	set_id: string;
	id: string;
	info: string;
}

export interface Cheer {
	bits: number;
}

export interface MessageReply {
	parent_message_id: string;
	parent_message_body: string;
	parent_user_id: string;
	parent_user_name: string;
	parent_user_login: string;
	thread_message_id: string;
	thread_user_id: string;
	thread_user_name: string;
	thread_user_login: string;
}

export interface BaseMessage {
	broadcaster_user_id: string;
	broadcaster_user_name: string;
	broadcaster_user_login: string;
	chatter_user_id: string;
	chatter_user_name: string;
	message_id: string;
	message: StructuredMessage;
	badges: Badge[];
	color: string;
	source_broadcaster_user_id?: string | null;
	source_broadcaster_user_name?: string | null;
	source_broadcaster_user_login?: string | null;
	source_message_id?: string | null;
	source_badges?: Badge[] | null;
}

export interface ChannelChatMessage extends BaseMessage {
	chatter_user_login: string;
	message_type: MessageType;
	cheer?: Cheer | null;
	reply?: MessageReply | null;
	channel_points_custom_reward_id?: string | null;
}

export interface BaseNotification extends BaseMessage {
	chatter_is_anonymous: boolean;
	system_message: string;
}

export interface SubNotification extends BaseNotification {
	notice_type: "sub";
	sub: {
		sub_tier: "1000" | "2000" | "3000";
		is_prime: boolean;
		duration_months: number;
	};
	shared_chat_sub: SubNotification["sub"] | null;
}

export interface ResubNotification extends BaseNotification {
	notice_type: "resub";
	resub: {
		cumulative_months: number;
		duration_months: number;
		streak_months: number;
		sub_tier: "1000" | "2000" | "3000";
		is_prime: boolean | null;
		is_gift: boolean;
		gifter_is_anonymous: boolean | null;
		gifter_user_id: string | null;
		gifter_user_name: string | null;
		gifter_user_login: string | null;
	};
	shared_chat_resub: ResubNotification["resub"] | null;
}

export interface SubGiftNotification extends BaseNotification {
	notice_type: "sub_gift";
	sub_gift: {
		duration_months: number;
		cumulative_total: number | null;
		recipient_user_id: string;
		recipient_user_name: string;
		recipient_user_login: string;
		sub_tier: "1000" | "2000" | "3000";
		community_gift_id: string | null;
	};
	shared_chat_sub_gift: SubGiftNotification["sub_gift"] | null;
}

export interface CommunitySubGiftNotification extends BaseNotification {
	notice_type: "community_sub_gift";
	community_sub_gift: {
		id: string;
		total: number;
		sub_tier: "1000" | "2000" | "3000";
		cumulative_total: number | null;
	};
	shared_chat_community_sub_gift:
		| CommunitySubGiftNotification["community_sub_gift"]
		| null;
}

export interface GiftPaidUpgradeNotification extends BaseNotification {
	notice_type: "gift_paid_upgrade";
	gift_paid_upgrade: {
		gifter_is_anonymous: boolean;
		gifter_user_id: string;
		gifter_user_name: string;
	};
	shared_chat_gift_paid_upgrade:
		| GiftPaidUpgradeNotification["gift_paid_upgrade"]
		| null;
}

export interface PrimePaidUpgradeNotification extends BaseNotification {
	notice_type: "prime_paid_upgrade";
	prime_paid_upgrade: {
		sub_tier: "1000" | "2000" | "3000";
	};
	shared_chat_prime_paid_upgrade:
		| PrimePaidUpgradeNotification["prime_paid_upgrade"]
		| null;
}

export interface PayItForwardNotification extends BaseNotification {
	notice_type: "pay_it_forward";
	pay_it_forward: {
		gifter_is_anonymous: boolean;
		gifter_user_id: string | null;
		gifter_user_name: string | null;
		gifter_user_login: string | null;
	};
	shared_chat_pay_it_forward:
		| PayItForwardNotification["pay_it_forward"]
		| null;
}

export interface RaidNotification extends BaseNotification {
	notice_type: "raid";
	raid: {
		user_id: string;
		user_name: string;
		user_login: string;
		viewer_count: number;
		profile_image_url: string;
	};
	shared_chat_raid: RaidNotification["raid"] | null;
}

export interface UnraidNotification extends BaseNotification {
	notice_type: "unraid";
	unraid: Record<string, never>;
}

export interface AnnouncementNotification extends BaseNotification {
	notice_type: "announcement";
	announcement: {
		color: string;
	};
	shared_chat_announcement: AnnouncementNotification["announcement"] | null;
}

export interface BitsBadgeTierNotification extends BaseNotification {
	notice_type: "bits_badge_tier";
	bits_badge_tier: {
		tier: string;
	};
}

export interface CharityDonationNotification extends BaseNotification {
	notice_type: "charity_donation";
	charity_donation: {
		charity_name: string;
		amount: {
			value: number;
			decimal_place: number;
			currency: string;
		};
	};
}

export type ChannelChatNotification =
	| SubNotification
	| ResubNotification
	| SubGiftNotification
	| CommunitySubGiftNotification
	| GiftPaidUpgradeNotification
	| PrimePaidUpgradeNotification
	| PayItForwardNotification
	| RaidNotification
	| UnraidNotification
	| AnnouncementNotification
	| BitsBadgeTierNotification
	| CharityDonationNotification;

export interface UserUpdate {
	user_id: string;
	user_login: string;
	user_name: string;
	description: string;
}
