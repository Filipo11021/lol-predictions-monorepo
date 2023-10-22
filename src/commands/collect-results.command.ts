import {
  CacheType,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";
import { db } from "../utils/db";
import fs from "node:fs";
import { $Enums } from "@prisma/client";

export const data = new SlashCommandBuilder()
  .setName("collect")
  .setDescription("collect all results")
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addBooleanOption((option) =>
    option
      .setName("public")
      .setDescription(
        "czy wynik ma być publiczny czy widoczny tylko dla ciebie?"
      )
  )
  .addStringOption((option) => option.setName("id").setDescription("Podaj id"));

export const execute = async (
  interaction: ChatInputCommandInteraction<CacheType>
) => {
  try {
    const isPublic = interaction.options.getBoolean("public");
    const gameDayId = interaction.options.getString("id");

    const data = !!gameDayId
      ? await db.gameDay.findUnique({
          where: { id: gameDayId },
          include: {
            games: {
              include: {
                voters: {
                  include: {
                    user: {
                      include: {
                        _count: {
                          select: {
                            votes: true,
                          },
                        },
                      },
                    },
                    team: true,
                  },
                },
                teams: true,
              },
            },
          },
        })
      : (
          await db.currentGameDay.findUnique({
            where: { id: "main" },
            include: {
              gameDay: {
                include: {
                  games: {
                    include: {
                      voters: {
                        include: {
                          user: {
                            include: {
                              _count: {
                                select: {
                                  votes: true,
                                },
                              },
                            },
                          },
                          team: true,
                        },
                      },
                      teams: true,
                    },
                  },
                },
              },
            },
          })
        )?.gameDay;

    const allCount = await db.game.count();

    const result = data?.games.map(({ voters, teams, id, type }) => ({
      all_votes_count: allCount,
      teams: teams.map(({ code, name, image }) => ({ code, name, image })),
      type: type ?? $Enums.MatchType.BO3,
      id,
      voters: voters.map(({ team, user: { username, id, _count }, score }) => ({
        username,
        teamCode: team.code,
        teamName: team.name,
        user_id: id,
        score,
        votes_count: _count.votes,
      })),
    }));

    if (!result) {
      await interaction.reply({
        content: "Brak danych",
        ephemeral: isPublic === true ? false : true,
      });
      return;
    }

    const date = new Date();
    const fileName = `results_${date.getHours()}-${date.getMinutes()}_${date.getDate()}.${date.getMonth()}.${date.getFullYear()}.json`;

    fs.writeFileSync(fileName, JSON.stringify(result), { encoding: "utf8" });

    await interaction.reply({
      files: [fileName],
      content: "results:",
      ephemeral: isPublic === true ? false : true,
    });

    fs.unlinkSync(fileName);
  } catch (error) {
    console.log(error);
    throw Error();
  }
};
