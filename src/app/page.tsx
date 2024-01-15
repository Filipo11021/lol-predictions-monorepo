import { db } from "@/utils/db";
import { PointsTable } from "./points-table";

export const revalidate = 120;

export default async function Home() {
  const [data, gamesCount] = await Promise.all([
    db.user.findMany({
      include: {
        votes: {
          include: {
            Game: true,
          },
        },
      },
    }),
    db.game.count({ where: { winnerCode: { not: null } } }),
  ]);

  const users: Array<{ username: string; points: number; coverage: number }> =
    [];
  for (const user of data) {
    users.push({
      username: user.username,
      points: user.votes
        .map(({ teamCode, Game: { winnerCode } }) =>
          teamCode === winnerCode ? 1 : 0
        )
        .reduce((a, b) => a + b, 0 as number),
      coverage:
        (user.votes.filter(({ Game: { winnerCode } }) => winnerCode).length *
          100) /
        gamesCount,
    });
  }

  return (
    <div className="mx-auto max-w-xl">
      <PointsTable data={users} />
      <p className="my-8 opacity-80">
        last update: {new Date().toLocaleString("pl")}
      </p>
    </div>
  );
}
