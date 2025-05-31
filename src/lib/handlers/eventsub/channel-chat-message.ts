import { defineHandler } from "../helper";

export default defineHandler({
	name: "channel.chat.message",
	handle(data) {
		console.log(data);
	},
});
