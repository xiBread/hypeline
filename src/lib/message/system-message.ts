import type { Emote } from "$lib/tauri";
import type {
	AutoModMessageStatus,
	AutoModTermsMetadata,
	ChannelUnbanRequestCreate,
	ChannelUnbanRequestResolve,
	WarnMetadata,
} from "$lib/twitch/eventsub";
import type { Viewer } from "$lib/viewer.svelte";
import { Message } from "./message.svelte";

export interface SystemMessageData {
	deleted: boolean;
	is_recent: boolean;
	server_timestamp: number;
}

export interface AutoModContext {
	type: "autoMod";
	status: AutoModMessageStatus;
	user: Viewer;
	moderator: Viewer;
}

export interface BanStatusContext {
	type: "banStatus";
	banned: boolean;
	reason: string | null;
	user: Viewer;
	moderator?: Viewer;
}

export interface ClearContext {
	type: "clear";
	moderator?: Viewer;
}

export interface DeleteContext {
	type: "delete";
	text: string;
	user: Viewer;
	moderator?: Viewer;
}

export interface EmoteSetUpdateContext {
	type: "emoteSetUpdate";
	action: "added" | "removed" | "renamed";
	oldName?: string;
	emote: Emote;
	actor: Viewer;
}

export interface JoinContext {
	type: "join";
	channel: Viewer;
}

export interface ModeContext {
	type: "mode";
	mode: string;
	enabled: boolean;
	seconds: number;
	moderator: Viewer;
}

export interface RoleStatusContext {
	type: "roleStatus";
	role: string;
	added: boolean;
	user: Viewer;
	broadcaster: Viewer;
}

export interface StreamStatusContext {
	type: "streamStatus";
	online: boolean;
	broadcaster: Viewer;
}

export interface SuspicionStatusContext {
	type: "suspicionStatus";
	active: boolean;
	previous: "monitoring" | "restricting" | null;
	user: Viewer;
	moderator: Viewer;
}

export interface TermContext {
	type: "term";
	data: AutoModTermsMetadata;
	moderator: Viewer;
}

export interface TimeoutContext {
	type: "timeout";
	seconds: number;
	reason: string | null;
	user: Viewer;
	moderator?: Viewer;
}

export interface UnbanRequestContext {
	type: "unbanRequest";
	request: ChannelUnbanRequestCreate | ChannelUnbanRequestResolve;
	user: Viewer;
	moderator?: Viewer;
}

export interface UntimeoutContext {
	type: "untimeout";
	user: Viewer;
	moderator: Viewer;
}

export interface WarnContext {
	type: "warn";
	warning: WarnMetadata;
	user: Viewer;
	moderator: Viewer;
}

export interface WarnAckContext {
	type: "warnAck";
	user: Viewer;
}

export type SystemMessageContext =
	| AutoModContext
	| BanStatusContext
	| ClearContext
	| DeleteContext
	| EmoteSetUpdateContext
	| JoinContext
	| ModeContext
	| RoleStatusContext
	| StreamStatusContext
	| SuspicionStatusContext
	| TermContext
	| TimeoutContext
	| UnbanRequestContext
	| UntimeoutContext
	| WarnContext
	| WarnAckContext;

/**
 * System messages are messages constructed internally and sent to relay
 * information to the user.
 */
export class SystemMessage extends Message {
	#id = crypto.randomUUID();
	#text = "";

	public context: SystemMessageContext | null = null;

	public constructor(data: Partial<SystemMessageData> = {}) {
		const prepared: SystemMessageData = {
			deleted: data.deleted ?? false,
			is_recent: data.is_recent ?? false,
			server_timestamp: data.server_timestamp ?? Date.now(),
		};

		super(prepared, true);
	}

	public static joined(channel: Viewer) {
		const message = new SystemMessage();
		return message.setContext({ type: "join", channel });
	}

	public override get id() {
		return this.#id;
	}

	public override get text() {
		return this.#text;
	}

	public setContext(context: SystemMessageContext) {
		this.context = context;
		return this;
	}

	public setText(text: string) {
		this.#text = text;
		return this;
	}
}
