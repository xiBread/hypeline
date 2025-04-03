import { z } from "zod";

export const getUsers = z.array(
	z.object({
		id: z.string(),
		login: z.string(),
		display_name: z.string(),
		type: z.enum(["admin", "global_mod", "staff", ""]),
		broadcaster_type: z.enum(["affiliate", "partner", ""]),
		description: z.string(),
		profile_image_url: z.string(),
		offline_image_url: z.string(),
		view_count: z.number(),
		email: z.string().optional(),
		created_at: z.string().transform((v) => new Date(v)),
	}),
);

export const createEventSubSubscription = z.object({
	data: z.tuple([
		z.object({
			id: z.string(),
			status: z.enum([
				"enabled",
				"webhook_callback_verification_pending",
			]),
			type: z.string(),
			version: z.enum(["1", "2"]),
			condition: z.record(z.string(), z.string()),
			created_at: z.string().transform((v) => new Date(v)),
			transport: z.object({
				method: z.enum(["webhook", "websocket", "conduit"]),
				callback: z.string().optional(),
				session_id: z.string().optional(),
				connected_at: z
					.string()
					.optional()
					.transform((v) => (v ? new Date(v) : v)),
				conduit_id: z.string().optional(),
			}),
			cost: z.number(),
		}),
	]),
	total: z.number(),
	total_cost: z.number(),
	max_total_cost: z.number(),
});

export type GetUsers = z.infer<typeof getUsers>;
