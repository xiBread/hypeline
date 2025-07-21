import { defineCommand } from "./util";

export default defineCommand({
	name: "unvip",
	description: "Revoke VIP status from a user",
	broadcasterOnly: true,
	args: [
		{
			name: "username",
			required: true,
		},
	],
	async exec(args, channel, user) {},
});
