'use server';

import { validateDiscordUser } from '@/discord-auth/get-discord-user';
import { prisma } from '@repo/database';

export async function selectPickAction({
	questionId,
	value,
}: {
	value: string;
	questionId: string;
}) {
	try {
		const discordUser = await validateDiscordUser();
		if (!discordUser.ok) throw Error('Unauthorized');
		if (typeof questionId !== 'string' || typeof value !== 'string') {
			return { ok: false };
		}

		await prisma.answer.upsert({
			where: {
				questionId_userId: {
					questionId,
					userId: discordUser.data.id,
				},
			},
			create: {
				questionId,
				userId: discordUser.data.id,
				selectedOptions: [value],
			},
			update: {
				selectedOptions: [value],
			},
		});
		return { ok: true };
	} catch {
		return { ok: false };
	}
}
