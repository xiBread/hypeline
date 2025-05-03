import { SystemMessage } from "$lib/message";
import { app } from "$lib/state.svelte";
import { Viewer } from "$lib/viewer.svelte";
import { defineHandler } from "../helper";

export default defineHandler({
	name: "channel.moderate",
	handle(data) {
		const message = new SystemMessage();

		let moderator = app.active.viewers.get(data.moderator_user_login);
		moderator ??= new Viewer({
			id: data.moderator_user_id,
			username: data.moderator_user_login,
			displayName: data.moderator_user_name,
		});

		switch (data.action) {
			case "ban": {
				let target = app.active.viewers.get(data.ban.user_login);
				target ??= Viewer.from(data.ban);

				app.active.addMessage(message.ban(target, moderator));
				break;
			}

			case "timeout": {
				let target = app.active.viewers.get(data.timeout.user_login);
				target ??= Viewer.from(data.timeout);

				const expiration = new Date(data.timeout.expires_at);
				const duration =
					expiration.getTime() - message.timestamp.getTime();

				app.active.addMessage(
					message.timeout(
						Math.ceil(duration / 1000),
						target,
						moderator,
					),
				);
			}
		}
	},
});
