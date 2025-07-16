import { defineCommand } from "./helper";
import unban from "./unban";

export default defineCommand({
	name: "untimeout",
	description: "Remove a timeout on a user",
	args: [
		{
			name: "username",
			required: true,
		},
	],
	exec: unban.exec,
});
