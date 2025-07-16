import { defineCommand } from "./util";

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
