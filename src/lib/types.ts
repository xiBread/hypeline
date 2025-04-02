import type { GetUsers } from "./twitch-api";

export type User = GetUsers[number] & { accessToken: string };
