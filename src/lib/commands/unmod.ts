import { defineCommand } from "./helper";

export default defineCommand({
	name: "unmod",
	description: "Revoke moderator status from a user",
	args: [
		{
			name: "username",
			required: true,
		},
	],
	async exec(args, channel, user) {},
});
