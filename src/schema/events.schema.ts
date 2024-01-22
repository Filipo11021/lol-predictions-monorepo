import { z } from "zod";

const eventSchema = z.union([
  z.object({
    startTime: z.string(),
    state: z.string(),
    type: z.string(),
    blockName: z.string(),
    league: z.object({ name: z.string(), slug: z.string() }),
    match: z.object({
      id: z.string(),
      flags: z.array(z.string()),
      teams: z.array(
        z.object({
          name: z.string(),
          code: z.string(),
          image: z.string(),
          result: z.object({
            outcome: z.string(),
            gameWins: z.number(),
          }),
          record: z.object({ wins: z.number(), losses: z.number() }),
        })
      ),
      strategy: z.object({ type: z.string(), count: z.number() }),
    }),
  }),
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
  z.object({
    startTime: z.string(),
    state: z.string(),
    type: z.string(),
    blockName: z.string(),
    league: z.object({ name: z.string(), slug: z.string() }),
    match: z.object({
      id: z.string(),
      flags: z.array(z.unknown()),
      teams: z.array(
        z.object({
          name: z.string(),
          code: z.string(),
          image: z.string(),
          result: z.object({ outcome: z.null(), gameWins: z.number() }),
          record: z.object({ wins: z.number(), losses: z.number() }),
        })
      ),
      strategy: z.object({ type: z.string(), count: z.number() }),
    }),
  }),
]);

export const scheduleResponseSchema = z.object({
  data: z.object({
    schedule: z.object({
      events: z.array(eventSchema),
    }),
  }),
});

export type EventT = z.infer<typeof eventSchema>;
