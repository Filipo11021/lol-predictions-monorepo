import { PointsTable } from "./points-table";
import { pointsTableData } from "./points-table.data";

export default async function Home() {
  const { data } = await pointsTableData();

  return (
    <div className="mx-auto max-w-lg">
      <PointsTable data={data} />
      <p className="my-8 opacity-80">
        last update: {new Date().toLocaleString("pl")}
      </p>
    </div>
  );
}
