import { defineCommand } from "./util";

export default defineCommand({
	name: "unique",
	description: "Prevent users from sending duplicate messages",
	async exec(args, channel, user) {},
});
