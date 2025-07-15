import { defineCommand } from "./helper";

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
