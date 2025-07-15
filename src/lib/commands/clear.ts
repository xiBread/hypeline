import { defineCommand } from "./helper";

export default defineCommand({
	name: "clear",
	description: "Clear chat history for non-moderator viewers",
	async exec(args, channel, user) {},
});
