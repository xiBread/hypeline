import { SystemMessage } from "$lib/message";
import { Viewer } from "$lib/viewer.svelte";
import { defineHandler } from "../helper";

export default defineHandler({
	name: "channel.unban_request.create",
	handle(data, channel) {
		const message = new SystemMessage();

		channel.addMessage(
			message.setContext({
				type: "unbanRequest",
				request: data,
				user: Viewer.fromBasic(data),
			}),
		);
	},
});
