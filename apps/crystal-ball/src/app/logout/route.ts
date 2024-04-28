import { env } from '@/env';
import {
	clearDiscordTokensCookie,
	getDiscordRefreshTokenFromCookie,
} from '@/discord-auth/discord-tokens';

export async function GET(): Promise<Response> {
	try {
		const refreshCookie = getDiscordRefreshTokenFromCookie();

		if (!refreshCookie) {
			return new Response(null, {
				status: 302,
				headers: {
					Location: '/login',
				},
			});
		}

		const data = new URLSearchParams();
		data.append('token', refreshCookie);
		data.append('token_type_hint', 'refresh_token');
		data.append('client_id', env.DISCORD_ID);
		data.append('client_secret', env.DISCORD_SECRET);

		await fetch('https://discord.com/api/oauth2/token/revoke', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				body: data.toString(),
			},
		});
		clearDiscordTokensCookie();

		return new Response(null, {
			status: 302,
			headers: {
				Location: '/login',
			},
		});
	} catch {
		return new Response(null, {
			status: 302,
			headers: {
				Location: '/login',
			},
		});
	}
}
