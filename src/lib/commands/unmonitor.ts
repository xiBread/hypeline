import { defineCommand } from "./util";

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
