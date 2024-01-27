import { calculatePoints } from '@/utils/calculatePoints';
import { db } from '@/utils/db';
import type { GamesTableData, GamesTableInfo } from './games-columns';

export async function gamesTableData(
	arg: { type: 'all' } | { type: 'one'; id: string }
): Promise<{
	tableData: Array<GamesTableData>;
	tableInfo: GamesTableInfo;
}> {
	const [data] = await Promise.all([
		arg.type === 'one'
			? db.gameDay.findFirst({
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
			  })
			: db.game.findMany({
					include: {
						voters: {
							include: { user: true },
						},
						winner: true,
					},
			  }),
	]);

	if (!data) throw Error('unknown games data');

	const sortedGames = ('games' in data ? data.games : data).sort(
		(a, b) => a.startTime.getTime() - b.startTime.getTime()
	);

	const tableData: Record<PropertyKey, GamesTableData> = {};
	const tableInfo: GamesTableInfo = {};

	sortedGames?.forEach((game, index) => {
		tableInfo[`team${index}`] = {
			teams: game.teamCodes,
			winner: { code: game.winnerCode },
		};
		game.voters.forEach((vote) => {
			const points = calculatePoints({
				type: game.type,
				winner: { code: game.winnerCode, score: '1-0' },
				voter: { code: vote.teamCode, score: vote.score },
			});

			if (!tableData[vote.user.username]) {
				tableData[vote.user.username] = {
					username: vote.user.username,
					points: points as number,
				};
				tableData[vote.user.username][`team${index}`] = vote.teamCode;

				return;
			}

			tableData[vote.user.username].points += points;
			tableData[vote.user.username][`team${index}`] = vote.teamCode;
		});
	});

	return { tableData: Object.values(tableData), tableInfo };
}
