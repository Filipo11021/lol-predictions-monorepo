import { TableTitle } from "@/app/shared/TableTitle";
import { getAllGameDays } from "../shared/game-days.data";
import { GamesTable } from "./games-table";
import { gamesTableData } from "./games-table.data";

export default async function Home() {
	const [{ tableData, tableInfo }, gameDays] = await Promise.all([
		gamesTableData({ type: "all" }),
		getAllGameDays(),
	]);

	return (
		<div className="mx-auto w-full relative p-4">
			<TableTitle />
			<GamesTable
				gameDays={gameDays}
				tableData={tableData}
				tableInfo={tableInfo}
			/>
		</div>
	);
}
