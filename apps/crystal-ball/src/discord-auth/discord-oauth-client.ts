import { env } from '@/env';
import { Discord } from 'arctic';

export const discord = new Discord(
	env.DISCORD_ID,
	env.DISCORD_SECRET,
	env.DISCORD_REDIRECT_URI
);
