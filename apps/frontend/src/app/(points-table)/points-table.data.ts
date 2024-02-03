import { calculatePoints } from '@/utils/calculatePoints';
import { prisma } from '@repo/database';
import type { PointsTableData } from './points-columns';

export async function pointsTableData(): Promise<{
	data: Array<PointsTableData>;
}> {
	const [data, gamesCount] = await Promise.all([
		prisma.user.findMany({
			include: {
				votes: {
					include: {
						Game: true,
					},
				},
			},
		}),
		prisma.game.count({ where: { winnerCode: { not: null } } }),
	]);

	const users: Array<
		Pick<PointsTableData, 'username' | 'points' | 'coverage'>
	> = [];
	for (const user of data) {
		users.push({
			username: user.username,
			points: user.votes
				.map(({ teamCode, score, Game: { winnerCode, type }, Game }) =>
					calculatePoints({
						type,
						voter: { code: teamCode, score },
						winner: { code: winnerCode, score: Game.score },
					})
				)
				.reduce((a, b) => a + b, 0 as number),
			coverage:
				(user.votes.filter(({ Game: { winnerCode } }) => winnerCode).length *
					100) /
				gamesCount,
		});
	}

	const sortedData = users.sort((a, b) => b.points - a.points);
	const dataWithIndex: Array<PointsTableData> = [];

	let currentIndex = 0;
	sortedData.forEach((user, i) => {
		currentIndex =
			user.points !== sortedData[i - 1]?.points
				? currentIndex + 1
				: currentIndex;

		dataWithIndex.push({
			username: user.username,
			points: user.points,
			coverage: user.coverage,
			index: currentIndex,
		});
	});

	return { data: dataWithIndex };
}
