import { invoke } from "@tauri-apps/api/core";
import { Channel } from "./channel.svelte";
import type { FullChannel, UserEmote, UserWithColor } from "./tauri";
import { User } from "./user";

interface ChannelEmote {
	username: string;
	profile_picture_url: string;
	emotes: Omit<UserEmote, "owner" | "owner_profile_picture_url">[];
}

export class AuthUser extends User {
	public emotes: ChannelEmote[] = [];
	public following = $state<Channel[]>([]);

	public constructor(
		data: UserWithColor,
		public readonly token: string,
	) {
		super(data);

		this.setColor(data.color);
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

	public async loadEmotes() {
		if (this.emotes.length) return this.emotes;

		const grouped: Record<string, ChannelEmote> = {};

		const emotes = await invoke<UserEmote[]>("get_user_emotes");
		emotes.sort((a, b) => a.owner.localeCompare(b.owner));

		for (const { owner, owner_profile_picture_url, ...emote } of emotes) {
			if (!grouped[owner]) {
				grouped[owner] = {
					username: owner,
					profile_picture_url: owner_profile_picture_url,
					emotes: [],
				};
			}

			grouped[owner].emotes.push(emote);
		}

		this.emotes = Object.values(grouped);
		return this.emotes;
	}
}
