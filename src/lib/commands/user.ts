import { defineCommand } from "./util";

export default defineCommand({
	name: "user",
	description: "Display profile information about a user on the channel",
	args: [
		{
			name: "username",
			required: true,
		},
	],
	async exec(args, channel, user) {},
});
