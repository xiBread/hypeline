import { defineCommand } from "./util";

export default defineCommand({
	name: "clear",
	description: "Clear chat history for non-moderator viewers",
	async exec(args, channel, user) {},
});
