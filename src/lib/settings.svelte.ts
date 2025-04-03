import type { User } from "./auth";

export interface Settings {
	user: User | undefined;
}

export const settings = $state<Settings>({
	user: undefined,
});
