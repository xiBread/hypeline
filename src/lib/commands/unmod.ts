import { defineCommand } from "./util";

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
