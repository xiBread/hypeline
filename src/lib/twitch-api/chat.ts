export interface Message {
	broadcaster_user_id: string;
	broadcaster_user_name: string;
	broadcaster_user_login: string;
	chatter_user_id: string;
	chatter_user_name: string;
	chatter_user_login: string;
	message_id: string;
	message: StructuredMessage;
	message_type:
		| "text"
		| "channel_points_highlighted"
		| "channel_points_sub_only"
		| "user_intro"
		| "power_ups_message_effect"
		| "power_ups_gigantified_emote";
	badges: Badge[];
	cheer?: { bits: number };
	color: string;
	reply?: MessageReply;
	channel_points_custom_reward_id?: string;
	source_broadcaster_user_id?: string;
	source_broadcaster_user_name?: string;
	source_broadcaster_user_login?: string;
	source_message_id?: string;
	source_badges?: Badge[];
}

export interface StructuredMessage {
	text: string;
	fragments: (Fragment & { text: string })[];
}

export interface TextFragment {
	type: "text";
	text: string;
}

export interface CheermoteFragment {
	type: "cheermote";
	prefix: string;
	bits: number;
	tier: number;
}

export interface EmoteFragment {
	type: "emote";
	id: string;
	emote_set_id: string;
	owner_id: string;
	format: ("static" | "animated")[];
}

export interface MentionFragment {
	type: "mention";
	user_id: string;
	user_name: string;
	user_login: string;
}

export type Fragment =
	| TextFragment
	| CheermoteFragment
	| EmoteFragment
	| MentionFragment;

export interface Badge {
	set_id: string;
	id: string;
	info: string;
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
