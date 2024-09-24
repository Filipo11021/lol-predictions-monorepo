import { PredictionsTitle } from '@/app/(app)/shared/predictions-title';
import { getAllGameDays } from '../shared/game-days.data';
import { GamesTable } from './games-table';
import { gamesTableData } from './games-table.data';

export const revalidate = 2;
export const dynamic = 'force-dynamic';

export default async function Home() {
	const [{ tableData, tableInfo }, gameDays] = await Promise.all([
		gamesTableData({ type: 'all' }),
		getAllGameDays(),
	]);

	return (
		<div className="relative mx-auto min-h-screen w-full p-4">
			<PredictionsTitle />
			<GamesTable
				gameDays={gameDays}
				tableData={tableData}
				tableInfo={tableInfo}
			/>
		</div>
	);
}
