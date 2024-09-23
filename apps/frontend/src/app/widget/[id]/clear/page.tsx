import { prisma } from '@repo/database';

export default async function WidgetPage({
	params,
}: { params: { id: string } }) {
	const game = params.id !== 'last' ? await prisma.game.findUnique({
		where: {
			id: params.id,
		},
	}) : await prisma.game.findFirst({
    where: {
      startTime: {}
    }
  })
	const votes = await Promise.all(
		game?.teamCodes.map(async (teamCode) => ({
			count: await prisma.vote.count({
				where: { gameId: params.id, teamCode: teamCode },
			}),
			teamCode,
		})) ?? []
	);

	return (
		<div className='flex max-w-fit items-center gap-4 rounded-sm p-3 text-white'>
			<ScoreCard count={votes[0].count} teamCode={votes[0].teamCode} />
			<div>VS</div>
			<ScoreCard count={votes[1].count} teamCode={votes[1].teamCode} />
		</div>
	);
}

function ScoreCard({ count, teamCode }: { teamCode: string; count: number }) {
	return (
		<div className='flex flex-col items-center justify-center'>
			<div className="text-xl font-medium">{teamCode}</div>
			<div className="font-extrabold text-2xl">{count}</div>
		</div>
	);
}
