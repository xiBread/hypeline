import { defineCommand } from "./util";

export default defineCommand({
	name: "shared-chat",
	description: "Start a new shared chat session or join one in an existing collaboration",
	broadcasterOnly: true,
	async exec(args, channel, user) {},
});
