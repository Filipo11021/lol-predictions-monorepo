import { env } from '@/env';
import { cookies } from 'next/headers';

export function setDiscordTokensCookie({
	accessToken,
	refreshToken,
	accessTokenExpiresAt,
}: { accessToken: string; refreshToken: string; accessTokenExpiresAt: Date }) {
	cookies().set('discord_access_token', accessToken, {
		secure: env.NODE_ENV === 'production',
		path: '/',
		httpOnly: true,
		expires: accessTokenExpiresAt,
	});

	cookies().set('discord_refresh_token', refreshToken, {
		secure: env.NODE_ENV === 'production',
		path: '/',
		httpOnly: true,
		maxAge: 60 * 60 * 24 * 30, // 30 days
	});
}

export function getDiscordRefreshTokenFromCookie() {
	return cookies().get('discord_refresh_token')?.value;
}

export function getDiscordAccessTokenFromCookie() {
	return cookies().get('discord_access_token')?.value;
}

export function clearDiscordTokensCookie() {
	cookies().delete('discord_access_token');
	cookies().delete('discord_refresh_token');
}
