import { PredictionsTitle } from '@/app/shared/predictions-title';
import { getAllGameDays } from '../shared/game-days.data';
import { GamesTable } from './games-table';
import { gamesTableData } from './games-table.data';

export default async function Home() {
	const [{ tableData, tableInfo }, gameDays] = await Promise.all([
		gamesTableData({ type: 'all' }),
		getAllGameDays(),
	]);

	return (
		<div className="mx-auto w-full relative p-4">
			<PredictionsTitle />
			<GamesTable
				gameDays={gameDays}
				tableData={tableData}
				tableInfo={tableInfo}
			/>
		</div>
	);
}
