import { defineCommand } from "./util";

export default defineCommand({
	name: "monitor",
	description: "Start monitoring a user's messages",
	args: [
		{
			name: "username",
			required: true,
		},
	],
	async exec(args, channel, user) {},
});
