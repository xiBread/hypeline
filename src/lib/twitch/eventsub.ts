export interface BaseAction<A extends string> {
	action: A;
	broadcaster_user_id: string;
	broadcaster_user_login: string;
	broadcaster_user_name: string;
	source_broadcaster_user_id: string;
	source_broadcaster_user_login: string;
	source_broadcaster_user_name: string;
	moderator_user_id: string;
	moderator_user_login: string;
	moderator_user_name: string;
}

export interface ActionMetadata {
	user_id: string;
	user_name: string;
	user_login: string;
}

export interface AutomodTermsMetadata {
	action: "add" | "remove";
	list: "blocked" | "permitted";
	terms: string[];
	from_automod: boolean;
}

export interface BanMetadata extends ActionMetadata {
	reason: string | null;
}

export interface DeleteMetadata extends ActionMetadata {
	message_id: string;
	message_body: string;
}

export interface FollowersMetadata {
	follow_duration_minutes: number;
}

export interface RaidMetadata extends ActionMetadata {
	viewer_count: number;
}

export interface SlowMetadata {
	wait_time_seconds: number;
}

export interface TimeoutMetadata extends BanMetadata {
	expires_at: string;
}

export interface UnbanRequestMetadata extends ActionMetadata {
	is_approved: boolean;
	moderator_message: string;
}

export interface WarnMetadata extends ActionMetadata {
	reason: string | null;
	chat_rules_cited: string[] | null;
}

export interface AutomodTermsAction
	extends BaseAction<
		| "add_blocked_term"
		| "add_permitted_term"
		| "remove_blocked_term"
		| "remove_permitted_term"
	> {
	automod_terms: AutomodTermsMetadata;
}

export interface BanAction extends BaseAction<"ban"> {
	ban: BanMetadata;
}

export type ClearAction = BaseAction<"clear">;

export interface DeleteAction extends BaseAction<"delete"> {
	delete: DeleteMetadata;
}

export type EmoteOnlyAction = BaseAction<"emoteonly" | "emoteonlyoff">;

export interface FollowersAction
	extends BaseAction<"followers" | "followersoff"> {
	followers: FollowersMetadata | null;
}

export interface ModAction extends BaseAction<"mod"> {
	mod: ActionMetadata;
}

export interface RaidAction extends BaseAction<"raid"> {
	raid: RaidMetadata;
}

export interface SlowAction extends BaseAction<"slow" | "slowoff"> {
	slow: SlowMetadata | null;
}

export type SubscribersAction = BaseAction<"subscribers" | "subscribersoff">;

export interface TimeoutAction extends BaseAction<"timeout"> {
	timeout: TimeoutMetadata;
}

export interface UnbanAction extends BaseAction<"unban"> {
	unban: ActionMetadata;
}

export interface UnbanRequestAction
	extends BaseAction<"approve_unban_request" | "deny_unban_request"> {
	unban_request: UnbanRequestMetadata;
}

export type UniqueAction = BaseAction<"uniquechat" | "uniquechatoff">;

export interface UnmodAction extends BaseAction<"unmod"> {
	unmod: ActionMetadata;
}

export interface UnraidAction extends BaseAction<"unraid"> {
	unraid: ActionMetadata;
}

export interface UntimeoutAction extends BaseAction<"untimeout"> {
	untimeout: ActionMetadata;
}

export interface UnvipAction extends BaseAction<"unvip"> {
	unvip: ActionMetadata;
}

export interface VipAction extends BaseAction<"vip"> {
	vip: ActionMetadata;
}

export interface WarnAction extends BaseAction<"warn"> {
	warn: WarnMetadata;
}

export type ChannelModerate =
	| AutomodTermsAction
	| BanAction
	| ClearAction
	| DeleteAction
	| EmoteOnlyAction
	| FollowersAction
	| ModAction
	| RaidAction
	| SlowAction
	| SubscribersAction
	| TimeoutAction
	| UnbanAction
	| UnbanRequestAction
	| UniqueAction
	| UnmodAction
	| UnraidAction
	| UntimeoutAction
	| UnvipAction
	| VipAction
	| WarnAction;

export interface StreamOffline {
	broadcaster_user_id: string;
	broadcaster_user_login: string;
	broadcaster_user_name: string;
}

export interface StreamOnline extends StreamOffline {
	id: string;
	type: "live" | "playlist" | "premiere" | "rerun";
	started_at: string;
}

export interface SubscriptionEventMap {
	"channel.moderate": ChannelModerate;
	"stream.online": StreamOnline;
	"stream.offline": StreamOffline;
}

export type SubscriptionEvent =
	SubscriptionEventMap[keyof SubscriptionEventMap];

export interface NotificationPayload {
	subscription: { type: string };
	event: SubscriptionEvent;
}
