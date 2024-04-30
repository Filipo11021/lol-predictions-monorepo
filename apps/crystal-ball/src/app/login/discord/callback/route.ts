import { discord } from '@/discord-auth/discord-oauth-client';
import { setDiscordTokensCookie } from '@/discord-auth/discord-tokens';
import { getDiscordUser } from '@/discord-auth/get-discord-user';
import { prisma } from '@repo/database';
import { OAuth2RequestError } from 'arctic';
import { cookies } from 'next/headers';

export async function GET(request: Request): Promise<Response> {
	const url = new URL(request.url);
	const code = url.searchParams.get('code');
	const state = url.searchParams.get('state');
	const storedState = cookies().get('discord_oauth_state')?.value ?? null;

	// biome-ignore lint/complexity/useSimplifiedLogicExpression: <explanation>
	if (!code || !state || !storedState || state !== storedState) {
		return new Response(null, {
			status: 302,
			headers: {
				Location: '/login?error=unknown',
			},
		});
	}

	try {
		const tokens = await discord.validateAuthorizationCode(code);

		const discordUser = await getDiscordUser({
			accessToken: tokens.accessToken,
		});

		if (!discordUser.ok) {
			return new Response(null, {
				status: 302,
				headers: {
					Location: '/login?error=unknown',
				},
			});
		}

		await prisma.user.upsert({
			where: {
				id: discordUser.data.id,
			},
			create: {
				id: discordUser.data.id,
				username: discordUser.data.username,
				avatar: `https://cdn.discordapp.com/avatars/${discordUser.data.id}/${discordUser.data.avatar}.png`,
			},
			update: {
				username: discordUser.data.username,
				avatar: `https://cdn.discordapp.com/avatars/${discordUser.data.id}/${discordUser.data.avatar}.png`,
			},
		});

		setDiscordTokensCookie(tokens);

		return new Response(null, {
			status: 302,
			headers: {
				Location: '/',
			},
		});
	} catch (e) {
		// the specific error message depends on the provider
		if (e instanceof OAuth2RequestError) {
			// invalid code
			return new Response(null, {
				status: 302,
				headers: {
					Location: '/login?error=unknown',
				},
			});
		}
		return new Response(null, {
			status: 302,
			headers: {
				Location: '/login?error=unknown',
			},
		});
	}
}
