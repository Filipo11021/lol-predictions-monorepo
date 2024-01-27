import { type ZodSchema, z } from 'zod';

const mainEventSchema = z.object({
	startTime: z.string(),
	state: z.string(),
	type: z.string(),
	blockName: z.string(),
	league: z.object({ name: z.string(), slug: z.string() }),
	match: z.object({
		id: z.string(),
		teams: z.array(
			z.object({
				name: z.string(),
				code: z.string(),
				image: z.string(),
				result: z.object({
					outcome: z.null().or(z.string()),
					gameWins: z.number(),
				}),
				record: z.object({ wins: z.number(), losses: z.number() }),
			})
		),
		strategy: z.object({ type: z.string(), count: z.number() }),
	}),
});

const eventSchema = z.union([
	mainEventSchema,
	z.object({
		startTime: z.string(),
		state: z.string(),
		type: z.string(),
		league: z.object({
			name: z.string(),
			slug: z.string(),
			image: z.string(),
		}),
	}),
]);

export const scheduleResponseSchema = z.object({
	data: z.object({
		schedule: z.object({
			events: z
				.array(eventSchema)
				.transform((arr) =>
					arr.filter((data) => mainEventSchema.safeParse(data).success)
				) as unknown as ZodSchema<z.infer<typeof mainEventSchema>[]>,
		}),
	}),
});

export type EventT = z.infer<typeof mainEventSchema>;
