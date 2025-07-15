import { defineCommand } from "./helper";

export default defineCommand({
	name: "timeout",
	description: "Temporarily restrict a user from sending messages",
	args: [
		{ name: "username", required: true },
		{ name: "duration", required: false },
		{ name: "reason", required: false },
	],
	async exec(args, channel, user) {},
});
