import { defineCommand } from "./helper";

export default defineCommand({
	name: "ban",
	description: "Permanently ban a user from chat",
	args: [
		{ name: "username", required: true },
		{ name: "reason", required: false },
	],
	async exec(args, channel, user) {},
});
