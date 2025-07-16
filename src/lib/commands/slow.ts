import { defineCommand } from "./util";

export default defineCommand({
	name: "slow",
	description: "Limit how frequently users can send messages",
	args: [
		{
			name: "duration",
			required: false,
		},
	],
	async exec(args, channel, user) {},
});
