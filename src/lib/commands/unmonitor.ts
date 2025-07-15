import { defineCommand } from "./helper";

export default defineCommand({
	name: "unmonitor",
	description: "Stop monitoring a user's messages",
	args: [
		{
			name: "username",
			required: true,
		},
	],
	async exec(args, channel, user) {},
});
