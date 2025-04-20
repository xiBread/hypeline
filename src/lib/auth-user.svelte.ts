import { invoke } from "@tauri-apps/api/core";
import type { UserEmote, UserWithColor } from "./tauri";
import { User } from "./user";

interface ChannelEmote {
	username: string;
	profile_picture_url: string;
	emotes: Omit<UserEmote, "owner" | "owner_profile_picture_url">[];
}

export class AuthUser extends User {
	public emotes: ChannelEmote[] = [];

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
		return user;
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
