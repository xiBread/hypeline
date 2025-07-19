import { defineCommand } from "./util";

export default defineCommand({
	name: "vip",
	description: "Grant VIP status to a user",
	args: [
		{
			name: "username",
			required: true,
		},
	],
	async exec(args, channel, user) {},
});
