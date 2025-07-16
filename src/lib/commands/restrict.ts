import { defineCommand } from "./util";

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
