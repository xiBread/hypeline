export interface HostFile {
	format: string;
}

export interface EmoteHost {
	url: string;
	files: HostFile[];
}

export interface EmoteData {
	flags: number;
	host: EmoteHost;
}

export interface Emote {
	id: string;
	name: string;
	data: EmoteData;
}

export interface EmoteSet {
	id: string;
	name: string;
}

export interface Paint {
	name: string;
	css: string;
}

export interface Connection {
	id: string;
	platform: "TWITCH" | "KICK" | "YOUTUBE" | "DISCORD";
	username: string;
	display_name: string;
}

export interface UserStyle {
	color: number;
	badge_id: string;
	paint_id: string;
}

export interface User {
	id: string;
	avatar_url: string;
	username: string;
	display_name: string;
	role_ids: string[];
	connections: Connection[];
	style: UserStyle;
}

export interface HostFile {
	format: string;
	frame_count: number;
	width: number;
	height: number;
	name: string;
	static_name: string;
}

export interface Host {
	files: HostFile[];
	url: string;
}

export interface BadgeCosmetic {
	id: string;
	host: Host;
	name: string;
	tooltip: string;
}

export interface CosmeticCreateBadge {
	id: string;
	kind: "BADGE";
	data: BadgeCosmetic;
}

export interface PaintShadow {
	color: number;
	radius: number;
	x_offset: number;
	y_offset: number;
}

export interface PaintStop {
	color: number;
	at: number;
}

export interface PaintCosmetic {
	id: string;
	name: string;
	angle: number;
	color: number | null;
	function: "LINEAR_GRADIENT" | "RADIAL_GRADIENT" | "URL";
	image_url: string;
	shape: "circle" | "ellipse";
	repeat: boolean;
	shadows: PaintShadow[];
	stops: PaintStop[];
}

export interface CosmeticCreatePaint {
	id: string;
	kind: "PAINT";
	data: PaintCosmetic;
}

export type CosmeticCreate = CosmeticCreateBadge | CosmeticCreatePaint;

export interface EntitlementCreate {
	id: string;
	kind: "BADGE" | "PAINT" | "EMOTE_SET";
	ref_id: string;
	user: User;
}

export interface SevenTvEventMap {
	"cosmetic.create": CosmeticCreate;
	"emote_set.update": ChangeMap;
	"entitlement.create": EntitlementCreate;
}

export interface ChangeMap {
	id: string;
	kind: number;
	actor: User;
	pushed?: { value: Emote }[];
	pulled?: { old_value: Emote }[];
	updated?: { value: Emote; old_value: Emote }[];
}

export interface DispatchPayload {
	type: string;
	body: { object: unknown } | ChangeMap;
}
