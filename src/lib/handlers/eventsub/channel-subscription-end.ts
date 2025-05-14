import { SystemMessage } from "$lib/message";
import { app } from "$lib/state.svelte";
import { defineHandler } from "../helper";

export default defineHandler({
	name: "channel.subscription.end",
	handle(data) {
		if (!app.active) return;

		const tier = data.tier === "Prime" ? "Prime" : `Tier ${data.tier[0]}`;
		const text = `Your ${data.is_gift ? "gifted" : ""} ${tier} subscription has ended.`;

		const message = new SystemMessage();
		message.setText(text);

		app.active.addMessage(message);
	},
});
