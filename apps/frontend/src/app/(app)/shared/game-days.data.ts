import { prisma } from '@repo/database';

export function getAllGameDays() {
	return prisma.gameDay.findMany({ orderBy: { firstMatchStart: 'desc' } });
}
