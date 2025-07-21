import unban from "./unban";
import { defineCommand } from "./util";

export default defineCommand({
	name: "untimeout",
	description: "Remove a timeout on a user",
	modOnly: true,
	args: [
		{
			name: "username",
			required: true,
		},
	],
	exec: unban.exec,
});
