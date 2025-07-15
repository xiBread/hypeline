import { defineCommand } from "./helper";

export default defineCommand({
	name: "shoutout",
	description: "Highlight a channel for viewers to follow",
	args: [
		{
			name: "channel",
			required: true,
		},
	],
	async exec(args, channel, user) {},
});
