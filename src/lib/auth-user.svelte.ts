import { invoke } from "@tauri-apps/api/core";
import { Channel } from "./channel.svelte";
import type { FollowedChannel, User as HelixUser } from "./twitch/api";
import { User } from "./user";

export class AuthUser extends User {
	public readonly emotes = new Map();
	public readonly following = $state<Channel[]>([]);

	public constructor(
		data: HelixUser,
		public readonly token: string,
	) {
		super(data);
	}

	public static override async load(token: string): Promise<AuthUser> {
		const data = await invoke<HelixUser>("get_current_user");

		const user = new AuthUser(data, token);
		await user.loadFollowing();

		return user;
	}

	public async loadFollowing() {
		const channels = await invoke<FollowedChannel[]>("get_followed");

		for (const followed of channels) {
			const user = await User.load(followed.broadcaster_id);

			const channel = new Channel(user);
			await channel.loadStream();

			this.following.push(channel);
		}
	}
}
