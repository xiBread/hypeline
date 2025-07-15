import { defineCommand } from "./helper";

export default defineCommand({
	name: "unvip",
	description: "Revoke VIP status from a user",
	args: [
		{
			name: "username",
			required: true,
		},
	],
	async exec(args, channel, user) {},
});
