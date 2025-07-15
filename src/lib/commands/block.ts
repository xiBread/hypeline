import { defineCommand } from "./helper";

export default defineCommand({
	name: "block",
	description: "Block a user from interacting with you on Twitch",
	args: [
		{
			name: "username",
			required: true,
		},
	],
	async exec(args, channel, user) {},
});
