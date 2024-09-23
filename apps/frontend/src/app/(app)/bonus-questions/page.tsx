import { PredictionsTitle } from '@/app/(app)/shared/predictions-title';
import { getAllGameDays } from '../shared/game-days.data';
import { bonusQuestionsTableData } from './bonus-questions-data';
import { BonusQuestionTable } from './bonus-questions-table';

export default async function Home() {
	const [{ tableData, tableInfo }, gameDays] = await Promise.all([
		bonusQuestionsTableData({ type: 'all' }),
		getAllGameDays(),
	]);

	return (
		<div className="relative mx-auto w-full p-4">
			<PredictionsTitle />
			<BonusQuestionTable
				gameDays={gameDays}
				tableData={tableData.slice(-1619)}
				tableInfo={tableInfo}
			/>
		</div>
	);
}
