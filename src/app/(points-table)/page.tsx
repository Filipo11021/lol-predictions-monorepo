import { TableTitle } from "@/app/shared/table-title";
import { getAllGameDays } from "../shared/game-days.data";
import { PointsTable } from "./points-table";
import { pointsTableData } from "./points-table.data";

export default async function Home() {
	const [{ data }, gameDays] = await Promise.all([
		pointsTableData(),
		getAllGameDays(),
	]);

	return (
		<div className="mx-auto max-w-lg p-4">
			<TableTitle />
			<PointsTable gameDays={gameDays} data={data} />
			<p className="my-8 opacity-80">
				last update: {new Date().toLocaleString("pl")}
			</p>
		</div>
	);
}
