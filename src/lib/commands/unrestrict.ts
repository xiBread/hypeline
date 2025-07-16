import { defineCommand } from "./util";

export default defineCommand({
	name: "unrestrict",
	description: "Stop restricting a user's messages",
	args: [
		{
			name: "username",
			required: true,
		},
	],
	async exec(args, channel, user) {},
});
