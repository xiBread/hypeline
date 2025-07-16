import { defineCommand } from "./util";

export default defineCommand({
	name: "pin",
	description: "Pin a message you send into chat for the channel",
	args: [
		{
			name: "message",
			required: true,
		},
	],
	async exec(args, channel, user) {},
});
