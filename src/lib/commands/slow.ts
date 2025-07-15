import { defineCommand } from "./helper";

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
