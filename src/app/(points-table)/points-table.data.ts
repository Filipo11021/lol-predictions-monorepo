import { calculatePoints } from "@/utils/calculatePoints";
import { db } from "@/utils/db";
import type { PointsTableData } from "./points-columns";

export async function pointsTableData(): Promise<{
	data: Array<PointsTableData>;
}> {
	const [data, gamesCount] = await Promise.all([
		db.user.findMany({
			include: {
				votes: {
					include: {
						Game: true,
					},
				},
			},
		}),
		db.game.count({ where: { winnerCode: { not: null } } }),
	]);

	const users: Array<
		Pick<PointsTableData, "username" | "points" | "coverage">
	> = [];
	for (const user of data) {
		users.push({
			username: user.username,
			points: user.votes
				.map(({ teamCode, score, Game: { winnerCode, type } }) =>
					calculatePoints({
						type,
						voter: { code: teamCode, score },
						winner: { code: winnerCode, score: "1-0" },
					}),
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
