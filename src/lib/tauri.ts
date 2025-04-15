import type { Emote } from "./channel.svelte";
import type { BadgeSet, User as HelixUser, Stream } from "./twitch/api";

export interface UserWithColor {
	data: HelixUser;
	color: string | null;
}

export interface FullChannel {
	user: UserWithColor;
	stream: Stream | null;
}

export interface JoinedChannel extends FullChannel {
	id: string;
	emotes: Record<string, Emote>;
	badges: BadgeSet[];
}
