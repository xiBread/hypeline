export interface BadgeSet {
	set_id: string;
	versions: Badge[];
}

export interface Badge {
	id: string;
	image_url_1x: string;
	image_url_2x: string;
	image_url_4x: string;
	title: string;
	description: string;
}
