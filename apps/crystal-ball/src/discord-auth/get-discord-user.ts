import { headers } from 'next/headers';
import { discord } from './discord-oauth-client';
import {
	getDiscordAccessTokenFromCookie,
	getDiscordRefreshTokenFromCookie,
	setDiscordTokensCookie,
} from './discord-tokens';

export async function getDiscordUser({
	accessToken,
}: { accessToken: string }): Promise<
	{ ok: false } | { data: DiscordUser; ok: true }
> {
	const res = await fetch('https://discord.com/api/users/@me', {
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

	if (!res.ok) {
		return { ok: false };
	}

	const data: DiscordUser = await res.json();

	return { data, ok: true };
}

export async function validateDiscordUser(): Promise<
	{ ok: false } | { data: DiscordUser; ok: true }
> {
	const accessToken = getDiscordAccessTokenFromCookie();

	if (accessToken) {
		const discordUserResponse = await getDiscordUser({ accessToken });

		if (discordUserResponse.ok) return discordUserResponse;
	}

	const refreshToken = getDiscordRefreshTokenFromCookie();

	if (!refreshToken) return { ok: false };

	const newTokens = await discord.refreshAccessToken(refreshToken);

	setDiscordTokensCookie(newTokens);

	return getDiscordUser({ accessToken: newTokens.accessToken });
}

export function getDiscordUserFromHeader():
	| { ok: false }
	| { data: DiscordUser; ok: true } {
	const user = headers().get('x-user');
	if (!user) return { ok: false };
	return { data: JSON.parse(user) as DiscordUser, ok: true };
}

interface DiscordUser {
	id: string;
	username: string;
	avatar: string;
}
