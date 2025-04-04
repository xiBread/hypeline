import { type AuthUser } from "./twitch-api";

export interface Settings {
	user: AuthUser | undefined;
}

export const settings = $state<Settings>({
	user: undefined,
});
