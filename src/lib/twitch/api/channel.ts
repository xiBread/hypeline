// not part of the API
export interface FollowedChannel {
	user_id: string;
	user_login: string;
	user_name: string;
	profile_image_url: string;
	stream: Stream | null;
}

export interface Stream {
	id: string;
	user_id: string;
	user_login: string;
	user_name: string;
	game_id: string;
	game_name: string;
	type: "live";
	title: string;
	tags: string[];
	viewer_count: number;
	started_at: string;
	language: string;
	thumbnail_url: string;
	is_mature: boolean;
}
