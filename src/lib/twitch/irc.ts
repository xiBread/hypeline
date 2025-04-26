import { Channel, invoke } from "@tauri-apps/api/core";
import { handlers } from "$lib/handlers";

export interface JoinMessage {
	type: "join";
	channel_login: string;
	user_login: string;
}

export interface ClearMsgMessage {
	type: "clearmsg";
	channel_login: string;
	sender_login: string;
	message_id: string;
	message_text: string;
	is_action: boolean;
	server_timestamp: boolean;
}

export interface BasicUser {
	id: string;
	login: string;
	name: string;
}

export interface Badge {
	name: string;
	version: string;
}

export interface Range {
	start: number;
	end: number;
}

export interface Emote {
	id: string;
	range: Range;
	code: string;
}

export interface BaseUserMessage {
	channel_login: string;
	channel_id: string;
	sender: BasicUser;
	badges: Badge[];
	badge_info: Badge[];
	name_color: string;
	emotes: Emote[];
	message_id: string;
	server_timestamp: string;
}

export interface ReplyParent {
	message_id: string;
	message_text: string;
	user: BasicUser;
}

export interface ReplyThread {
	message_id: string;
	user_login: string;
}

export interface Reply {
	parent: ReplyParent;
	thread: ReplyThread;
}

export interface PrivmsgMessage extends BaseUserMessage {
	type: "privmsg";
	message_text: string;
	reply: Reply | null;
	is_action: boolean;
	is_first_msg: boolean;
	is_returning_chatter: boolean;
	is_highlighted: boolean;
	bits: number | null;
}

export interface SubGiftPromo {
	total_gifts: number;
	promo_name: string;
}

export interface AnnouncementEvent {
	type: "announcement";
	color: string;
}

export interface SubOrResubEvent {
	type: "sub_or_resub";
	is_resub: boolean;
	cumulative_months: number;
	streak_months: number | null;
	sub_plan: string;
	sub_plan_name: string;
}

export interface RaidEvent {
	type: "raid";
	viewer_count: number;
	profile_image_url: string;
}

export interface SubGiftEvent {
	type: "sub_gift";
	is_sender_anonymous: boolean;
	cumulative_months: number;
	recipient: BasicUser;
	sub_plan: string;
	sub_plan_name: string;
	num_gifted_months: number;
}

export interface SubMysteryGiftEvent {
	type: "sub_mystery_gift";
	mass_gift_count: number;
	sender_total_gifts: number | null;
	sub_plan: string;
}
export interface AnonSubMysteryGiftEvent {
	type: "anon_sub_mystery_gift";
	mass_gift_count: number;
	sub_plan: string;
}

export interface GiftPaidUpgradeEvent {
	type: "gift_paid_upgrade";
	gifter_login: string;
	gifter_name: string;
	promotion: SubGiftPromo | null;
}

export interface AnonGiftPaidUpgradeEvent {
	type: "anon_gift_paid_upgrade";
	promotion: SubGiftPromo | null;
}

export interface RitualEvent {
	type: "ritual";
	ritual_name: string;
}

export interface BitsBadgeTierEvent {
	type: "bits_badge_tier";
	threshold: number;
}

export type UserNoticeEvent =
	| AnnouncementEvent
	| SubOrResubEvent
	| RaidEvent
	| SubGiftEvent
	| SubMysteryGiftEvent
	| AnonSubMysteryGiftEvent
	| GiftPaidUpgradeEvent
	| AnonGiftPaidUpgradeEvent
	| RitualEvent
	| BitsBadgeTierEvent;

export interface UserNoticeMessage extends BaseUserMessage {
	type: "usernotice";
	message_text: string | null;
	system_message: string;
	event: UserNoticeEvent;
	event_id: string;
}

export interface NoticeMessage {
	type: "notice";
}

export type IrcMessage =
	| JoinMessage
	| ClearMsgMessage
	| PrivmsgMessage
	| UserNoticeMessage
	| NoticeMessage;

export type IrcMessageMap = {
	[K in IrcMessage["type"]]: Extract<IrcMessage, { type: K }>;
};

export async function connect() {
	const channel = new Channel<IrcMessage>(async (message) => {
		const handler = handlers.get(message.type);
		await handler?.handle(message);
	});

	await invoke("connect", { channel });
}
