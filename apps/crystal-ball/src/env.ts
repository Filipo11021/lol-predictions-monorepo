import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
	server: {
		DATABASE_URL: z.string().url(),
		DISCORD_ID: z.string().min(1),
		DISCORD_SECRET: z.string().min(1),
		DISCORD_REDIRECT_URI: z.string().min(1),
		NODE_ENV: z.enum(['development', 'production', 'test']),
	},
	client: {},
	// For Next.js >= 13.4.4, you only need to destructure client variables:
	experimental__runtimeEnv: {},
});
