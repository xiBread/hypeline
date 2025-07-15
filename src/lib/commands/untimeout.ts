import { defineCommand } from "./helper";

export default defineCommand({
	name: "untimeout",
	description: "Remove a timeout on a user",
	args: [
		{
			name: "username",
			required: true,
		},
	],
	async exec(args, channel, user) {},
});
