import { defineCommand } from "./util";

export default defineCommand({
	name: "user",
	description: "Display profile information about a user on the channel",
	args: ["username"],
	async exec(args, channel, user) {},
});
