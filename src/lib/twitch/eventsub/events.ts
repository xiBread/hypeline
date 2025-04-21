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

export interface ChannelChatMessageDelete {
	broadcaster_user_id: string;
	broadcaster_user_name: string;
	broadcaster_user_login: string;
	target_user_id: string;
	target_user_name: string;
	target_user_login: string;
	message_id: string;
}

export interface BaseNotification extends BaseMessage {
	chatter_is_anonymous: boolean;
	system_message: string;
}

export type SubTier = "1000" | "2000" | "3000";

export interface Sub {
	sub_tier: "1000" | "2000" | "3000";
	is_prime: boolean;
	duration_months: number;
}

export interface SubNotification extends BaseNotification {
	notice_type: "sub";
	sub: Sub;
	shared_chat_sub: Sub | null;
}

export interface Resub {
	cumulative_months: number;
	duration_months: number;
	streak_months: number | null;
	sub_tier: SubTier;
	is_prime: boolean | null;
	is_gift: boolean;
	gifter_is_anonymous: boolean | null;
	gifter_user_id: string | null;
	gifter_user_name: string | null;
	gifter_user_login: string | null;
}

export interface ResubNotification extends BaseNotification {
	notice_type: "resub";
	resub: Resub;
	shared_chat_resub: Resub | null;
}

export interface SubGift {
	duration_months: number;
	cumulative_total: number | null;
	recipient_user_id: string;
	recipient_user_name: string;
	recipient_user_login: string;
	sub_tier: SubTier;
	community_gift_id: string | null;
}

export interface SubGiftNotification extends BaseNotification {
	notice_type: "sub_gift";
	sub_gift: SubGift;
	shared_chat_sub_gift: SubGift | null;
}

export interface CommunitySubGift {
	id: string;
	total: number;
	sub_tier: SubTier;
	cumulative_total: number | null;
}

export interface CommunitySubGiftNotification extends BaseNotification {
	notice_type: "community_sub_gift";
	community_sub_gift: CommunitySubGift;
	shared_chat_community_sub_gift: CommunitySubGift | null;
}

export interface GiftPaidUpgrade {
	gifter_is_anonymous: boolean;
	gifter_user_id: string;
	gifter_user_name: string;
}

export interface GiftPaidUpgradeNotification extends BaseNotification {
	notice_type: "gift_paid_upgrade";
	gift_paid_upgrade: GiftPaidUpgrade;
	shared_chat_gift_paid_upgrade: GiftPaidUpgrade | null;
}

export interface PrimePaidUpgrade {
	sub_tier: "1000" | "2000" | "3000";
}

export interface PrimePaidUpgradeNotification extends BaseNotification {
	notice_type: "prime_paid_upgrade";
	prime_paid_upgrade: PrimePaidUpgrade;
	shared_chat_prime_paid_upgrade: PrimePaidUpgrade | null;
}

export interface PayItForward {
	gifter_is_anonymous: boolean;
	gifter_user_id: string | null;
	gifter_user_name: string | null;
	gifter_user_login: string | null;
}

export interface PayItForwardNotification extends BaseNotification {
	notice_type: "pay_it_forward";
	pay_it_forward: PayItForward;
	shared_chat_pay_it_forward: PayItForward | null;
}

export interface Raid {
	user_id: string;
	user_name: string;
	user_login: string;
	viewer_count: number;
	profile_image_url: string;
}

export interface RaidNotification extends BaseNotification {
	notice_type: "raid";
	raid: Raid;
	shared_chat_raid: Raid | null;
}

export interface UnraidNotification extends BaseNotification {
	notice_type: "unraid";
	unraid: Record<string, never>;
}

export interface Announcement {
	color: string;
}

export interface AnnouncementNotification extends BaseNotification {
	notice_type: "announcement";
	announcement: Announcement;
	shared_chat_announcement: Announcement | null;
}

export interface BitsBadgeTierNotification extends BaseNotification {
	notice_type: "bits_badge_tier";
	bits_badge_tier: {
		tier: string;
	};
}

export interface CharityDonationAmount {
	value: number;
	decimal_place: number;
	currency: string;
}

export interface CharityDonation {
	charity_name: string;
	amount: CharityDonationAmount;
}

export interface CharityDonationNotification extends BaseNotification {
	notice_type: "charity_donation";
	charity_donation: CharityDonation;
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
