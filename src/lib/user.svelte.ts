import { invoke } from "@tauri-apps/api/core";
import { SvelteMap } from "svelte/reactivity";
import { settings } from "./settings";
import type { Paint } from "./seventv";
import { app } from "./state.svelte";
import type { UserWithColor } from "./tauri";
import type { Badge, User as HelixUser } from "./twitch/api";
import type {
	BanEvasionEvaluation,
	WithBasicUser,
	WithBroadcaster,
	WithModerator,
	WithSourceBroadcaster,
} from "./twitch/eventsub";
import type { BasicUser } from "./twitch/irc";
import { makeReadable } from "./util";

export interface PartialUser {
	id: string;
	color?: string;
	username: string;
	displayName: string;
}

const requests = new Map<string, Promise<User>>();

export class User implements PartialUser {
	readonly #data: HelixUser;
	#color: string | null = null;

	/**
	 * Whether the user is the broadcaster.
	 */
	public isBroadcaster = $state(false);

	/**
	 * Whether the user is a moderator in the channel.
	 */
	public isMod = $state(false);

	/**
	 * Whether the user is a subscriber to the channel.
	 */
	public isSub = $state(false);

	/**
	 * Whether the user is a VIP in the channel.
	 */
	public isVip = $state(false);

	/**
	 * Whether the user is a returning user to the channel.
	 *
	 * Returning users are new users who have chatted at least twice in the
	 * last 30 days.
	 */
	public isReturning = $state(false);

	/**
	 * Whether the user's messages are being monitored. This is mutually
	 * exclusive with `restricted`.
	 */
	public monitored = $state(false);

	/**
	 * Whether the user's messages are being restricted. This is mutually
	 * exclusive with `monitored`.
	 */
	public restricted = $state(false);

	/**
	 * The likelihood that the user is ban evading if they are considered a
	 * suspicious user.
	 */
	public banEvasion = $state<BanEvasionEvaluation>("unknown");

	/**
	 * The 7TV badge for the user if they have one set.
	 */
	public badge = $state<Badge>();

	/**
	 * The 7TV paint for the user if they have one set.
	 */
	public paint = $state<Paint>();

	/**
	 * A map of channel ids to usernames that the user is a moderator in. This will
	 * always include the user's own id, and will only include other ids for
	 * the current user.
	 */
	public readonly moderating = new SvelteMap<string, string>();

	public constructor(data: UserWithColor) {
		this.#data = data.data;
		this.#color = data.color;

		this.moderating.set(this.id, this.username);
	}

	public static async from(id: string) {
		const cached = app.joined?.viewers.get(id);
		if (cached) return cached;

		const inProgress = requests.get(id);
		if (inProgress) return await inProgress;

		const request = (async () => {
			try {
				const data = await invoke<UserWithColor>("get_user_from_id", { id });
				const user = new User(data);

				if (id === settings.state.user?.id) {
					const channels = await invoke<[string, string][]>("get_moderated_channels");
					channels.forEach(([id, name]) => user.moderating.set(id, name));
				}

				app.joined?.viewers.set(user.id, user);

				return user;
			} finally {
				requests.delete(id);
			}
		})();

		requests.set(id, request);
		return await request;
	}

	public static fromBare(data: BasicUser, color?: string) {
		const cached = app.joined?.viewers.get(data.id);
		if (cached) return cached;

		const user = new User({
			data: {
				id: data.id,
				created_at: "0",
				login: data.login,
				display_name: data.name,
				description: "",
				profile_image_url: "",
				offline_image_url: "",
				type: "",
				broadcaster_type: "",
			},
			color: color ?? null,
		});

		app.joined?.viewers.set(user.id, user);

		return user;
	}

	public static fromBasic(data: WithBasicUser) {
		return this.fromBare({
			id: data.user_id,
			login: data.user_login,
			name: data.user_name,
		});
	}

	public static fromModerator(data: WithModerator) {
		return this.fromBare({
			id: data.moderator_user_id,
			login: data.moderator_user_login,
			name: data.moderator_user_name,
		});
	}

	public static fromBroadcaster(data: WithBroadcaster) {
		return this.fromBare({
			id: data.broadcaster_user_id,
			login: data.broadcaster_user_login,
			name: data.broadcaster_user_name,
		});
	}

	public static fromSource(data: WithSourceBroadcaster) {
		return this.fromBare({
			id: data.source_broadcaster_user_id,
			login: data.source_broadcaster_user_login,
			name: data.source_broadcaster_user_name,
		});
	}

	public get id() {
		return this.#data.id;
	}

	/**
	 * The date the user's account was created.
	 */
	public get createdAt() {
		return new Date(this.#data.created_at);
	}

	/**
	 * The color of the user's name. Defaults to the current foreground color
	 * if the user doesn't have a color set.
	 */
	public get color() {
		if (this.#color && settings.state.readableColors) {
			return makeReadable(this.#color);
		}

		return this.#color ?? "inherit";
	}

	/**
	 * The CSS style for the user's name.
	 */
	public get style() {
		const color = `color: ${this.color};`;

		return this.paint ? `${this.paint.css}; ${color}` : color;
	}

	public get username() {
		return this.#data.login;
	}

	/**
	 * The display name of the user. The capitalization may differ from the
	 * username.
	 *
	 * If the user has a localized name and localized names are enabled in
	 * settings, this will be the localized name followed by the username in
	 * parentheses.
	 */
	public get displayName() {
		if (settings.state.localizedNames && this.localizedName) {
			return `${this.localizedName} (${this.username})`;
		}

		return this.#data.display_name;
	}

	/**
	 * The localized display name of the user if they have their Twitch
	 * language set to Chinese, Japanese, or Korean.
	 */
	public get localizedName() {
		return this.#data.login !== this.#data.display_name.toLowerCase()
			? this.#data.display_name
			: null;
	}

	public get bio() {
		return this.#data.description;
	}

	public get avatarUrl() {
		return this.#data.profile_image_url;
	}

	public get bannerUrl() {
		return this.#data.offline_image_url;
	}

	/**
	 * Whether the user is Twitch staff.
	 */
	public get isStaff() {
		return this.#data.type === "staff";
	}

	/**
	 * Whether the user is a Twitch affiliate.
	 */
	public get isAffiliate() {
		return this.#data.broadcaster_type === "affiliate";
	}

	/**
	 * Whether the user is a Twitch partner.
	 */
	public get isPartner() {
		return this.#data.broadcaster_type === "partner";
	}

	/**
	 * Whether the user is considered suspicious in a channel i.e. their
	 * messages are being monitored or restricted, or they are suspected of ban
	 * evasion.
	 */
	public get isSuspicious() {
		return this.monitored || this.restricted || this.banEvasion !== "unknown";
	}

	public setColor(color: string | null) {
		this.#color = color;
		return this;
	}
}
