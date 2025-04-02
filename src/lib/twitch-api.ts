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

export type GetUsers = z.infer<typeof getUsers>;
