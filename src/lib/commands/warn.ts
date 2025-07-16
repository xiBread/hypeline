import { defineCommand } from "./util";

export default defineCommand({
	name: "warn",
	description:
		"Issue a warning to a user that they must acknowledge before sending more messages",
	args: [
		{ name: "username", required: true },
		{ name: "reason", required: true },
	],
	async exec(args, channel, user) {},
});
