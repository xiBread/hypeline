import { defineCommand } from "./helper";

export default defineCommand({
	name: "mod",
	description: "Grant moderator status to a user",
	args: [
		{
			name: "username",
			required: true,
		},
	],
	async exec(args, channel, user) {},
});
