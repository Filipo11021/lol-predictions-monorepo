import {
  CacheType,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";
import { hasAccess } from "../utils/auth";
import { db } from "../utils/db";
import fs from "node:fs";

export const data = new SlashCommandBuilder()
  .setName("results")
  .setDescription("get results");

export const execute = async (
  interaction: ChatInputCommandInteraction<CacheType>
) => {
  if (!hasAccess({ role: "public", user: interaction.user })) return;

  const data = await db.currentGameDay.findUnique({
    where: { id: "main" },
    include: {
      gameDay: {
        include: {
          games: {
            include: {
              voters: {
                include: {
                  user: true,
                  team: true,
                },
              },
              teams: true,
            },
          },
        },
      },
    },
  });

  const result = data?.gameDay?.games.map(({ voters, teams, id }) => ({
    voters: voters.map(({ team, user: { username, id } }) => ({
      username,
      teamCode: team.code,
      teamName: team.name,
      user_id: id,
    })),
    teams: teams.map(({ code, name, image }) => ({ code, name, image })),
    id,
  }));

  const date = new Date();
  const fileName = `results_${date.getHours()}-${date.getMinutes()}_${date.getDate()}.${date.getMonth()}.${date.getFullYear()}.json`;

  fs.writeFileSync(fileName, JSON.stringify(result), { encoding: "utf8" });

  await interaction.reply({ files: [fileName], content: "results:" });

  fs.unlinkSync(fileName);
};
