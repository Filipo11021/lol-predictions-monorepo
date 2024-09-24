import { prisma } from '@repo/database';

export function getAllGameDays() {
	return prisma.gameDay.findMany({ orderBy: { firstMatchStart: 'desc' }, where: {tournamentId: 'WORLDS_2024'} });
}
