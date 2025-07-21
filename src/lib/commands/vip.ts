import { defineCommand } from "./util";

export default defineCommand({
	name: "vip",
	description: "Grant VIP status to a user",
	broadcasterOnly: true,
	args: [
		{
			name: "username",
			required: true,
		},
	],
	async exec(args, channel, user) {},
});
