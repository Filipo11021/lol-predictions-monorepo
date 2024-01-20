import { db } from "@/utils/db";
import { PointsTable } from "./points-table";

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

  const sortedData = users.sort((a, b) => b.points - a.points);

  const dataWithIndex: Array<{
    username: string;
    points: number;
    coverage: number;
    index: number;
  }> = [];

  let currentIndex = 0;
  sortedData.forEach((user, i) => {
    currentIndex = user.points !== sortedData[i - 1]?.points
        ? currentIndex + 1
        : currentIndex;

    dataWithIndex.push({
      username: user.username,
      points: user.points,
      coverage: user.coverage,
      index: currentIndex,
    });
  });

  return (
    <div className="mx-auto max-w-lg">
      <PointsTable data={dataWithIndex} />
      <p className="my-8 opacity-80">
        last update: {new Date().toLocaleString("pl")}
      </p>
    </div>
  );
}
