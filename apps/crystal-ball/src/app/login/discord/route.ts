import { generateState } from 'arctic';
import { cookies } from 'next/headers';
import { discord } from '@/discord-auth/discord-oauth-client';
import { env } from '@/env';

export async function GET(): Promise<Response> {
	const state = generateState();

	const url = await discord.createAuthorizationURL(state, {
		scopes: ['identify'],
	});

	cookies().set('discord_oauth_state', state, {
		secure: env.NODE_ENV === 'production', // set to false in localhost
		path: '/',
		httpOnly: true,
		maxAge: 60 * 20, // 20 min
	});

	return Response.redirect(url);
}
