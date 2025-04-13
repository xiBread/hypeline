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

export interface ChannelChatMessage {
	broadcaster_user_id: string;
	broadcaster_user_name: string;
	broadcaster_user_login: string;
	chatter_user_id: string;
	chatter_user_name: string;
	chatter_user_login: string;
	message_id: string;
	message: StructuredMessage;
	message_type: MessageType;
	badges: Badge[];
	cheer: Cheer | null;
	color: string;
	reply: MessageReply | null;
	channel_points_custom_reward_id: string | null;
	source_broadcaster_user_id: string | null;
	source_broadcaster_user_name: string | null;
	source_broadcaster_user_login: string | null;
	source_message_id: string | null;
	source_badges: Badge[] | null;
}

export interface UserUpdate {
	user_id: string;
	user_login: string;
	user_name: string;
	description: string;
}
