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
export const COMMANDS: Command[] = [
	{
		name: "block",
		description: "Block a user from interacting with you on Twitch",
	},
	{
		name: "color",
		description: "Change your username color",
	},
	{
		name: "me",
		description: "Express an action in the third person",
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
	},
	{
		name: "unban",
		description: "Remove a permanent ban on a user",
	},
	{
		name: "announce",
		description: "Call attention to your message with a colored highlight",
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
	},
	{
		name: "mod",
		description: "Grant moderator status to a user",
	},
	{
		name: "unmod",
		description: "Revoke moderator status from a user",
	},
	{
		name: "monitor",
		description: "Start monitoring a user's messages",
	},
	{
		name: "unmonitor",
		description: "Stop monitoring a user's messages",
	},
	{
		name: "pin",
		description: "Pin a message you send into chat for the channel",
	},
	{
		name: "raid",
		description: "Send viewers to another channel when the stream ends",
	},
	{
		name: "unraid",
		description: "Stop an ongoing raid",
	},
	{
		name: "restrict",
		description: "Start restricting a user's messages",
	},
	{
		name: "unrestrict",
		description: "Stop restricting a user's messages",
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
	},
	{
		name: "slow",
		description: "Limit how frequently users can send messages",
	},
	{
		name: "subscriber-only",
		description: "Restrict chat to subscribers only",
	},
	{
		name: "timeout",
		description: "Temporarily restrict a user from sending messages",
	},
	{
		name: "untimeout",
		description: "Remove a timeout on a user",
	},
	{
		name: "unqiue",
		description: "Prevent users from sending duplicate messages",
	},
	{
		name: "user",
		description: "Display profile information about a user on the channel",
	},
	{
		name: "vip",
		description: "Grant VIP status to a user",
	},
	{
		name: "unvip",
		description: "Revoke VIP status from a user",
	},
	{
		name: "warn",
		description:
			"Issue a warning to a user that they must acknowledge before sending more messages",
	},
];
