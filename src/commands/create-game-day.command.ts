import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  CacheType,
  ChatInputCommandInteraction,
  ComponentType,
  Message,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";
import { createBO1Selects } from "../components/BO1Select";
import { db } from "../utils/db";

export const data = new SlashCommandBuilder()
  .setName("game")
  .setDescription("create game day")
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export const execute = async (
  interaction: ChatInputCommandInteraction<CacheType>
) => {
  const [selects, { title, displayStartDate, gameDayId }] =
    await createBO1Selects();

  await interaction.reply({ ephemeral: true, content: "generated games:" });
  const btn = new ButtonBuilder()
    .setCustomId("results")
    .setLabel("Sprawdź swoje wybory")
    .setStyle(ButtonStyle.Primary);

  const res = await interaction.channel?.send({
    components: [
      //@ts-expect-error
      ...selects.map((select) => new ActionRowBuilder().addComponents(select)),
      //@ts-expect-error
      new ActionRowBuilder().addComponents(btn),
    ],
    content: `${title} - koniec głosowania: ${displayStartDate} <@&1024338951881887764>`,
  });

  collectSelectResponses(res);

  await db.currentGameDay.update({
    data: {
      messageId: res?.id,
    },
    where: {
      id: "main",
    },
  });
};

export function collectSelectResponses(msg: Message | undefined) {
  // setInterval(() => {}, 1000 * 60);
  const collector = msg?.createMessageComponentCollector({
    componentType: ComponentType.StringSelect,
  });
  const btnCollector = msg?.createMessageComponentCollector({
    componentType: ComponentType.Button,
  });

  collector?.on("dispose", () => {
    console.log("dispose");
  });

  collector?.on("end", () => {
    console.log("end");
  });

  collector?.on("ignore", () => {
    console.log("ignore");
  });
  collector?.on("collect", async (i) => {
    const id = i.customId;

    setInterval(async () => {
      const res = await db.currentGameDay.findUnique({
        where: { id: "main" },
        include: { gameDay: true },
      });

      if (
        new Date().getTime() >
        new Date(res?.gameDay?.firstMatchStart ?? "").getTime()
      ) {
        collector.stop();
        i.reply("Zakończono głosowanie")
      }
    }, 60 * 1000);

    const va = i.values[0].split("_")
    const selection = va[0]
    const score = va[1]

    await db.user.upsert({
      where: { id: i.user.id },
      create: {
        id: i.user.id,
        username:
          i.user.username === i.user.tag || !i.user.tag
            ? i.user.username
            : `${i.user.username}#${i.user.tag}`,
      },
      update: {},
    });

    try {
      const role = i?.guild?.roles.cache.get("1024338951881887764");
      if (!Array.isArray(i.member?.roles) && !!role) {
        i.member?.roles?.add(role);
      }
    } catch {}

    const r = await db.vote.upsert({
      where: {
        id: id + i.user.id,
      },
      create: {
        id: id + i.user.id,
        gameId: id,
        userId: i.user.id,
        teamCode: selection,
        score,
      },
      update: {
        teamCode: selection,
        score,
      },
    });
    await i.reply({
      content: `wybrano ${r.teamCode} ${r.score !== "1-0" ? r.score : ""}`.trim(),
      ephemeral: true,
    });
  });

  btnCollector?.on("collect", async (i) => {
    const id = i.customId;

    if (id === "results") {
      const res = await db.currentGameDay.findUnique({
        where: { id: "main" },
        include: {
          gameDay: {
            include: {
              games: {
                include: {
                  voters: {
                    where: { userId: i.user.id },
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

      i.reply({
        ephemeral: true,
        content: a
          ?.map(
            ({ voters }, i) =>
              `${i + 1}. ${
                voters.length === 0
                  ? "Brak"
                  : `${voters[0].teamName} ${
                      voters[0].score !== "1-0" ? voters[0].score : ""
                    }`.trim()
              }`
          )
          .join(" | "),
      });
      return;
    }
  });
}
