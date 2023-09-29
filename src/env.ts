import { z } from "zod";
import "dotenv/config";

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  NODE_ENV: z
    .literal("development")
    .or(z.literal("production"))
    .default("development"),

  DISCORD_TOKEN: z.string(),
  DISCORD_CHANNEL_ID: z.string(),
  DISCORD_GUILD_ID: z.string(),
  DISCORD_APP_ID: z.string(),

  LOLESPORTS_API_KEY: z.string(),
});

export const env = envSchema.parse(process.env);
