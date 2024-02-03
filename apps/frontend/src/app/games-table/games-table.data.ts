import { calculatePoints } from '@/utils/calculatePoints';
import { prisma } from '@repo/database';
import type { GamesTableData, GamesTableInfo } from './games-columns';

async function getGames(
	arg: { type: 'all' } | { type: 'fromGameDay'; id: string }
) {
	if (arg.type === 'fromGameDay') {
		const data = await prisma.gameDay.findFirst({
			where: { id: arg.id },
			include: {
				games: {
					include: {
						voters: {
							include: { user: true },
						},
						winner: true,
					},
				},
			},
		});
		return data?.games;
	}

	return prisma.game.findMany({
		include: {
			voters: {
				include: { user: true },
			},
			winner: true,
		},
	});
}

export async function gamesTableData(
	arg: { type: 'all' } | { type: 'fromGameDay'; id: string }
): Promise<{
	tableData: Array<GamesTableData>;
	tableInfo: GamesTableInfo;
}> {
	const [data] = await Promise.all([getGames(arg)]);

	if (!data) throw Error('unknown games data');

	const sortedGames = data.sort(
		(a, b) => a.startTime.getTime() - b.startTime.getTime()
	);

	const tableData: Record<PropertyKey, GamesTableData> = {};
	const tableInfo: GamesTableInfo = {};

	sortedGames?.forEach((game, index) => {
		tableInfo[`team${index}`] = {
			teams: game.teamCodes,
			winner: { code: game.winnerCode, score: game.score },
		};
		game.voters.forEach((vote) => {
			const points = calculatePoints({
				type: game.type,
				winner: { code: game.winnerCode, score: game.score },
				voter: { code: vote.teamCode, score: vote.score },
			});

			if (!tableData[vote.user.username]) {
				tableData[vote.user.username] = {
					username: vote.user.username,
					points: points as number,
				};
				tableData[vote.user.username][`team${index}`] = {
					code: vote.teamCode,
					score: vote.score,
				};

				return;
			}

			tableData[vote.user.username].points += points;
			tableData[vote.user.username][`team${index}`] = {
				code: vote.teamCode,
				score: vote.score,
			};
		});
	});

	return { tableData: Object.values(tableData), tableInfo };
}
