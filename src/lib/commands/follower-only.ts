import { defineCommand } from "./util";

export default defineCommand({
	name: "follower-only",
	description: "Restrict chat to followers based on their follow duration",
	args: [
		{
			name: "duration",
			required: false,
		},
	],
	async exec(args, channel, user) {},
});
