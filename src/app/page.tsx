"use server";
import { db } from "@/utils/db";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { PointsTable } from "./points-table";

export default async function Home() {
  const data = await db.user.findMany({
    include: {
      votes: {
        include: {
          Game: true
        }
      }
    }
  });

  const users: Array<{ username: string; points: number }> = [];
  for (const user of data) {
    users.push({
      username: user.username,
      points: user.votes
        .map(({ teamCode, Game: { winnerCode } }) =>
          teamCode === winnerCode ? 1 : 0
        )
        .reduce((a, b) => a + b, 0 as number),
    });
  }

  return (
    <div className="mx-auto max-w-xl p-4">
      <div className="relative">
      <h1
        style={{ backgroundImage: "linear-gradient(to top left,#19e6c3,#9470fd)" }}
        className="scroll-m-20 bg-clip-text text-transparent inline-block text-4xl mb-5 text-center font-extrabold tracking-tight lg:text-5xl"
      >
        LEC PREDYKCJE
      </h1>
      </div>
      <PointsTable data={users} />
    </div>
  );
}
