import { z } from "zod";

export const WebSocketMessage = z.object({
	metadata: z.object({
		message_type: z.enum([
			"session_welcome",
			"session_keepalive",
			"session_reconnect",
			"notification",
			"revocation",
		]),
	}),
	payload: z.record(z.any()),
});

export const SessionWelcome = z.object({
	session: z.object({ id: z.string() }),
});

export const Notification = z
	.object({
		subscription: z.object({ type: z.string() }),
		event: z.record(z.any()),
	})
	.transform((data) => ({
		type: data.subscription.type,
		event: data.event,
	}));
