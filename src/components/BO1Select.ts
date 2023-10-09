import {
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from "discord.js";
import { getCurrentEvents } from "../api/events.api";
import { EventT } from "../schema/events.schema";
import { db } from "../utils/db";
import { Team } from "@prisma/client";

function buildBO1Selects(events: EventT[]) {
  const selects = events.map(({ match: { id, teams } }) => {
    const options = teams.map(({ code, name }) => {
      return new StringSelectMenuOptionBuilder()
        .setLabel(`${name} (${code})`)
        .setValue(code);
    });

    const select = new StringSelectMenuBuilder()
      .setCustomId(id)
      .setPlaceholder(`${teams[0].name} vs ${teams[1].name}`)
      .addOptions(options)

    return select;
  });

  return selects;
}

async function createTeamIfNotExist({
  code,
  image,
  
  name,
}: Omit<Team, "gameIds">) {
  return db.team.upsert({
    where: {
      code,
    },
    update: {},
    create: {
      code,
      image,
      name,
    },
  });
}

async function createGame(
  gameDayId: string,
  { match: { teams }, match, startTime }: EventT
) {
  await Promise.all([
    createTeamIfNotExist({
      code: teams[0].code,
      image: teams[0].image,
      name: teams[0].name,
    }),
    createTeamIfNotExist({
      code: teams[1].code,
      image: teams[1].image,
      name: teams[1].name,
    }),
  ]);

  await db.game.upsert({
    where: {
      id: match.id,
    },
    create: {
      startTime,
      id: match.id,
      gameDayId,
      teamCodes: [teams[0].code, teams[1].code],
    },
    update: {},
  });
}

function generateIdFromEvents(events: EventT[]) {
  return events.map(({ match: { id } }) => id.slice(id.length - 10)).join("");
}

export async function createBO1Selects() {
  const events = await getCurrentEvents();

  const selects = buildBO1Selects(events);
  const gameDay = await db.gameDay.upsert({
    create: {
      firstMatchStart: events[0].startTime,
      id: generateIdFromEvents(events),
    },
    update: {},
    where: {
      id: generateIdFromEvents(events),
    },
    include: {
      games: true,
    },
  });

  await Promise.all(events.map((event) => createGame(gameDay.id, event)));

  await db.currentGameDay.upsert({
    create: { gameDayId: gameDay.id },
    update: { gameDayId: gameDay.id },
    where: {
      id: "main",
    },
  });

  const startDate = events[0].startTime;

  const title = events[0].blockName;

  return [
    selects,
    {
      startDate,
      displayStartDate: new Date(startDate).toLocaleString("pl").slice(0, -3),
      title,
      gameDayId: gameDay.id,
    },
  ] as const;
}
