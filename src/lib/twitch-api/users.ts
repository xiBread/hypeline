export interface User {
	id: string;
	login: string;
	display_name: string;
	type: "admin" | "global_mod" | "staff" | "";
	broadcaster_type: "affiliate" | "partner" | "";
	description: string;
	profile_image_url: string;
	offline_image_url: string;
	created_at: string;
}

export type AuthUser = User & { accessToken: string };
