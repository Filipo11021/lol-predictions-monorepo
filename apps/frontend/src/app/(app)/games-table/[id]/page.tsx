import { getAllGameDays } from '@/app/(app)/shared/game-days.data';
import { PredictionsTitle } from '@/app/(app)/shared/predictions-title';
import { GamesTable } from '../games-table';
import { gamesTableData } from '../games-table.data';

export default async function Home({ params }: { params: { id: string } }) {
	const [{ tableData, tableInfo }, gameDays] = await Promise.all([
		await gamesTableData({
			id: params.id,
			type: 'fromGameDay',
		}),
		getAllGameDays(),
	]);

	return (
		<div className="mx-auto min-h-screen max-w-4xl p-4">
			<PredictionsTitle />
			<GamesTable
				gameDays={gameDays}
				tableData={tableData}
				tableInfo={tableInfo}
			/>
			<p className="my-8 opacity-80">
				last update: {new Date().toLocaleString('pl')}
			</p>
		</div>
	);
}
