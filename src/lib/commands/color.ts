import { defineCommand } from "./helper";

export default defineCommand({
	name: "color",
	description: "Change your username color",
	args: [
		{
			name: "color",
			required: true,
		},
	],
	async exec(args, channel, user) {},
});
