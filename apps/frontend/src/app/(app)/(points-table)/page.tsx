import { PredictionsTitle } from '@/app/(app)/shared/predictions-title';
import { getAllGameDays } from '../shared/game-days.data';
import { PointsTable } from './points-table';
import { pointsTableData } from './points-table.data';

export default async function Home() {
	const [{ data }, gameDays] = await Promise.all([
		pointsTableData(),
		getAllGameDays(),
	]);

	return (
		<div className="mx-auto min-h-screen max-w-2xl p-4">
			<PredictionsTitle />
			<PointsTable gameDays={gameDays} data={data} />
			<p className="mt-2 mb-1 opacity-80">
				last update: {new Date().toLocaleString('pl')}
			</p>
		</div>
	);
}
