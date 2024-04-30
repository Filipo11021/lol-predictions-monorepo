import { validateDiscordUser } from '@/discord-auth/get-discord-user';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest): Promise<NextResponse> {
	const discordUser = await validateDiscordUser();

	if (discordUser.ok && request.nextUrl.pathname.startsWith('/login')) {
		return NextResponse.redirect(new URL('/', request.url), {
			headers: { 'x-user': JSON.stringify(discordUser) },
		});
	}

	if (discordUser.ok || request.nextUrl.pathname.startsWith('/login')) {
		return NextResponse.next({
			headers: {
				...(discordUser.ok && {
					'x-user': JSON.stringify(discordUser.data),
				}),
			},
		});
	}

	return NextResponse.redirect(new URL('/login', request.url));
}

export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - api (API routes)
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 */
		'/((?!stats|api|_next/static|_next/image|favicon.ico).*)',
	],
};
