import { defineCommand } from "./helper";

export default defineCommand({
	name: "restrict",
	description: "Start restricting a user's messages",
	args: [
		{
			name: "username",
			required: true,
		},
	],
	async exec(args, channel, user) {},
});
