import { PredictionsTitle } from '@/app/shared/predictions-title';
import { getAllGameDays } from '../shared/game-days.data';
import { PointsTable } from './points-table';
import { pointsTableData } from './points-table.data';

export default async function Home() {
	const [{ data }, gameDays] = await Promise.all([
		pointsTableData(),
		getAllGameDays(),
	]);

	return (
		<div className="mx-auto max-w-xl p-4">
			<PredictionsTitle />
			<PointsTable gameDays={gameDays} data={data} />
			<p className="my-8 opacity-80">
				last update: {new Date().toLocaleString('pl')}
			</p>
		</div>
	);
}
