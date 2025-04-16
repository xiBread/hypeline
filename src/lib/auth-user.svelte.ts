import { invoke } from "@tauri-apps/api/core";
import { Channel } from "./channel.svelte";
import type { FullChannel, UserWithColor } from "./tauri";
import { User } from "./user";

export class AuthUser extends User {
	public readonly emotes = new Map();
	public following = $state<Channel[]>([]);

	public constructor(
		data: UserWithColor,
		public readonly token: string,
	) {
		super(data);
	}

	public static override async load(token: string): Promise<AuthUser> {
		const data = await invoke<UserWithColor>("get_user_from_id", {
			id: null,
		});

		const user = new AuthUser(data, token);
		await user.loadFollowing();

		return user;
	}

	public async loadFollowing() {
		const channels = await invoke<FullChannel[]>("get_followed_channels");
		const following = [];

		for (const followed of channels) {
			const user = new User(followed.user);

			const channel = new Channel(user, followed.stream);
			following.push(channel);
		}

		this.following = following;
	}
}
