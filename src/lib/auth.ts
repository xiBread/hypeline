import {
	PUBLIC_TWITCH_CLIENT_ID,
	PUBLIC_TWITCH_REDIRECT_URL,
} from "$env/static/public";
import type { GetUsers } from "./twitch-api";

export type User = GetUsers[number] & { accessToken: string };

export const SCOPES = [
	// Channel
	"channel:edit:commercial",
	"channel:manage:broadcast",
	"channel:manage:moderators",
	"channel:manage:polls",
	"channel:manage:predictions",
	"channel:manage:raids",
	"channel:manage:redemptions",
	"channel:manage:vips",
	"channel:moderate",
	"channel:read:editors",
	"channel:read:hype_train",
	"channel:read:polls",
	"channel:read:predictions",
	"channel:read:redemptions",

	// Chat
	"chat:edit",
	"chat:read",

	// Moderation
	"moderator:manage:announcements",
	"moderator:manage:automod",
	"moderator:manage:banned_users",
	"moderator:manage:blocked_terms",
	"moderator:manage:chat_messages",
	"moderator:manage:chat_settings",
	"moderator:manage:shield_mode",
	"moderator:manage:shoutouts",
	"moderator:manage:unban_requests",
	"moderator:manage:warnings",
	"moderator:read:chatters",
	"moderator:read:moderators",
	"moderator:read:suspicious_users",
	"moderator:read:vips",

	// User
	"user:manage:blocked_users",
	"user:manage:chat_color",
	"user:manage:whispers",
	"user:read:blocked_users",
	"user:read:chat",
	"user:read:emotes",
	"user:read:follows",
	"user:read:moderated_channels",
	"user:write:chat",

	// Other
	"clips:edit",
	"whispers:read",
];

export function getAuthUrl() {
	const generatedState = crypto.randomUUID();

	const authSearchParams = {
		client_id: PUBLIC_TWITCH_CLIENT_ID,
		redirect_uri: PUBLIC_TWITCH_REDIRECT_URL,
		response_type: "token",
		scope: SCOPES.join(" "),
		state: generatedState,
	};

	const authUrl = new URL("https://id.twitch.tv/oauth2/authorize");

	for (const [key, value] of Object.entries(authSearchParams)) {
		authUrl.searchParams.set(key, value);
	}

	return authUrl;
}
