import type {
	Announcement,
	ChannelChatNotification,
} from "$lib/twitch/eventsub";
import { TextMessage } from "./text-message";

export class NotificationMessage extends TextMessage {
	public constructor(public readonly data: ChannelChatNotification) {
		super(data);
	}

	public get announcement(): Announcement | null {
		return this.data.notice_type === "announcement"
			? this.data.announcement
			: null;
	}

	public isAnnouncement(): this is NotificationMessage & {
		announcement: Announcement;
	} {
		return this.data.notice_type === "announcement";
	}
}
