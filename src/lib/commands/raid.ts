import { defineCommand } from "./util";

export default defineCommand({
	name: "raid",
	description: "Send viewers to another channel when the stream ends",
	args: [
		{
			name: "channel",
			required: true,
		},
	],
	async exec(args, channel, user) {},
});
