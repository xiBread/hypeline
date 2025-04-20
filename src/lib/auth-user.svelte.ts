import { invoke } from "@tauri-apps/api/core";
import type { UserWithColor } from "./tauri";
import { User } from "./user";

export class AuthUser extends User {
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
}
