import {
  CacheType,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";
import { db } from "../utils/db";

export const data = new SlashCommandBuilder()
  .setName("votes")
  .setDescription("Zobacz jak inni głosowali")
  .addUserOption((option) =>
    option
      .setName("user")
      .setRequired(true)
      .setDescription("Podaj użytkownika którego chcesz sprawdzić")
  )
  .addBooleanOption((option) =>
    option
      .setName("public")
      .setDescription(
        "czy wynik ma być publiczny czy widoczny tylko dla ciebie?"
      )
  );

export const execute = async (i: ChatInputCommandInteraction<CacheType>) => {
  const user = i.options.getUser("user");
  const isPublic = i.options.getBoolean("public");

  if (!user) {
    i.reply({ content: "podaj użytkownika", ephemeral: true });
    return;
  }

  const res = await db.currentGameDay.findUnique({
    where: { id: "main" },
    include: {
      gameDay: {
        include: {
          games: {
            include: {
              voters: {
                where: { userId: user.id },
                include: {
                  team: true,
                  user: true,
                },
              },
            },
          },
        },
      },
    },
  });
  const a = res?.gameDay?.games.map(({ voters, id }) => ({
    voters: voters.map(({ team, user: { username, id }, score }) => ({
      username,
      teamCode: team.code,
      teamName: team.name,
      user_id: id,
      score,
    })),
    id,
  }));

  if (!a) {
    await i.reply({
      content: "Brak danych",
      ephemeral: isPublic === true ? false : true,
    });
    return;
  }

  i.reply({
    ephemeral: isPublic === true ? false : true,
    content: `${user.username} - ${a
      ?.map(({ voters }, i) =>
        `${i + 1}. ${
          voters.length === 0
            ? "Brak"
            : `${voters[0].teamCode} ${
                voters[0].score !== "1-0" ? voters[0].score : ""
              }`
        }`.trim()
      )
      .join(" | ")}`,
  });
};
