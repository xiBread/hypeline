import { defineCommand } from "./util";

export default defineCommand({
	name: "marker",
	description: "Add a stream marker at the current timestamp",
	args: [
		{
			name: "description",
			required: false,
		},
	],
	async exec(args, channel, user) {},
});
