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

export type CheermoteImageSet = Record<
	"dark" | "light",
	Record<"animated" | "static", Record<string, string>>
>;

export interface CheermoteTier {
	min_bits: number;
	id: string;
	color: string;
	images: CheermoteImageSet;
	can_cheer: boolean;
	show_in_bits_card: boolean;
}

export type CheermoteType =
	| "global_first_party"
	| "global_third_party"
	| "channel_custom"
	| "display_only"
	| "sponsored";

export interface Cheermote {
	prefix: string;
	tiers: CheermoteTier[];
	type: CheermoteType;
	order: number;
	last_updated: string;
	is_charitable: boolean;
}
