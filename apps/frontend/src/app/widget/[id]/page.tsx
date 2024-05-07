import { prisma } from '@repo/database';
import '@repo/ui/theme.css';

export default async function WidgetPage({
	params,
}: { params: { id: string } }) {
	const game = await prisma.game.findUnique({
		where: {
			id: params.id,
		},
	});
	const votes = await Promise.all(
		game?.teamCodes.map(async (teamCode) => ({
      count: await prisma.vote.count({ where: { gameId: params.id, teamCode: teamCode } }),
      teamCode
    })
		) ?? []
	);



	return <div className="bg-black p-3 rounded-sm text-[#fe0000] m-8 flex max-w-fit gap-4 items-center">
    <ScoreCard count={votes[0].count} teamCode={votes[0].teamCode} />
    <div>VS</div>
    <ScoreCard count={votes[1].count} teamCode={votes[1].teamCode} />
  </div>;
}

function ScoreCard ({count, teamCode}: {teamCode: string, count: number}) {
  return <div className='flex justify-center items-center flex-col'>
    <div className='text-xl font-medium'>{teamCode}</div>
    <div className='font-extrabold text-2xl'>{count}</div>
  </div>
}