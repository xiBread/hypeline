import { defineCommand } from "./helper";

export default defineCommand({
	name: "unban",
	description: "Remove a permanent ban on a user",
	args: [
		{
			name: "username",
			required: true,
		},
	],
	async exec(args, channel, user) {},
});
