export interface CommandArg {
	name: string;
	required: boolean;
}

export interface Command {
	name: string;
	description: string;
	args?: CommandArg[];
	mod?: boolean;
}

// not supported: gift, help, vote, goal
export const commands: Command[] = [
	{
		name: "block",
		description: "Block a user from interacting with you on Twitch",
		args: [{ name: "username", required: true }],
	},
	{
		name: "color",
		description: "Change your username color",
		args: [{ name: "color", required: true }],
	},
	{
		name: "me",
		description: "Express an action in the third person",
		args: [{ name: "message", required: true }],
	},
	{
		name: "mods",
		description: "Display a lsit of moderators for this channel",
	},
	{
		name: "vips",
		description: "Display a list of VIPs for this channel",
	},
	{
		name: "ban",
		description: "Permanently ban a user from chat",
		args: [
			{ name: "username", required: true },
			{ name: "reason", required: false },
		],
	},
	{
		name: "unban",
		description: "Remove a permanent ban on a user",
		args: [{ name: "username", required: true }],
	},
	{
		name: "announce",
		description: "Call attention to your message with a colored highlight",
		args: [{ name: "message", required: true }],
	},
	{
		name: "clear",
		description: "Clear chat history for non-moderator viewers",
	},
	{
		name: "emote-only",
		description: "Restrict chat to emote only messages",
	},
	{
		name: "follower-only",
		description: "Restrict chat to followers based on their follow duration",
	},
	{
		name: "marker",
		description: "Add a stream marker at the current timestamp",
		args: [{ name: "description", required: false }],
	},
	{
		name: "mod",
		description: "Grant moderator status to a user",
		args: [{ name: "username", required: true }],
	},
	{
		name: "unmod",
		description: "Revoke moderator status from a user",
		args: [{ name: "username", required: true }],
	},
	{
		name: "monitor",
		description: "Start monitoring a user's messages",
		args: [{ name: "username", required: true }],
	},
	{
		name: "unmonitor",
		description: "Stop monitoring a user's messages",
		args: [{ name: "username", required: true }],
	},
	{
		name: "pin",
		description: "Pin a message you send into chat for the channel",
		args: [{ name: "message", required: true }],
	},
	{
		name: "raid",
		description: "Send viewers to another channel when the stream ends",
		args: [{ name: "channel", required: true }],
	},
	{
		name: "unraid",
		description: "Stop an ongoing raid",
	},
	{
		name: "restrict",
		description: "Start restricting a user's messages",
		args: [{ name: "username", required: true }],
	},
	{
		name: "unrestrict",
		description: "Stop restricting a user's messages",
		args: [{ name: "username", required: true }],
	},
	{
		name: "shared-chat",
		description: "Start a new shared chat session or join one in an existing collaboration",
	},
	{
		name: "shield",
		description: "Restrict chat and ban harassing chatters",
	},
	{
		name: "shoutout",
		description: "Highlight a channel for viewers to follow",
		args: [{ name: "channel", required: true }],
	},
	{
		name: "slow",
		description: "Limit how frequently users can send messages",
		args: [{ name: "duration", required: false }],
	},
	{
		name: "subscriber-only",
		description: "Restrict chat to subscribers only",
	},
	{
		name: "timeout",
		description: "Temporarily restrict a user from sending messages",
		args: [
			{ name: "username", required: true },
			{ name: "duration", required: false },
			{ name: "reason", required: false },
		],
	},
	{
		name: "untimeout",
		description: "Remove a timeout on a user",
		args: [{ name: "username", required: true }],
	},
	{
		name: "unqiue",
		description: "Prevent users from sending duplicate messages",
	},
	{
		name: "user",
		description: "Display profile information about a user on the channel",
		args: [{ name: "username", required: true }],
	},
	{
		name: "vip",
		description: "Grant VIP status to a user",
		args: [{ name: "username", required: true }],
	},
	{
		name: "unvip",
		description: "Revoke VIP status from a user",
		args: [{ name: "username", required: true }],
	},
	{
		name: "warn",
		description:
			"Issue a warning to a user that they must acknowledge before sending more messages",
		args: [
			{ name: "username", required: true },
			{ name: "reason", required: true },
		],
	},
];
