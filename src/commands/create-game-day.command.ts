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

  const selects1 = selects.slice(0, 4);
  const selects2 = selects.slice(4, selects.length);

  const arr =
    selects2.length === 0
      ? [
          ...selects1.map((select) =>
            new ActionRowBuilder().addComponents(select)
          ),
          new ActionRowBuilder().addComponents(btn),
        ]
      : [
          ...selects1.map((select) =>
            new ActionRowBuilder().addComponents(select)
          ),
        ];

  const res1 = await interaction.channel?.send({
    //@ts-expect-error
    components: arr,
    content: `${title} - koniec głosowania: ${displayStartDate} <@&1024338951881887764>`,
  });

  const res2 =
    selects2.length > 0
      ? await interaction.channel?.send({
          components: [
            //@ts-expect-error
            ...selects2.map((select) =>
              new ActionRowBuilder().addComponents(select)
            ),
            //@ts-expect-error
            new ActionRowBuilder().addComponents(btn),
          ],
        })
      : undefined;

  await collectSelectResponses(res1, { withEndMessage: true });
  if (res2) {
    await collectSelectResponses(res2, { withEndMessage: false });
  }

  await db.currentGameDay.update({
    data: {
      messageId: res2?.id ? `${res1?.id}$$${res2?.id}` : res1?.id,
    },
    where: {
      id: "main",
    },
  });
};

export async function collectSelectResponses(
  msg: Message | undefined,
  { withEndMessage = true }: { withEndMessage: boolean }
) {
  if (!msg) return;

  const collector = msg?.createMessageComponentCollector({
    componentType: ComponentType.StringSelect,
  });
  const btnCollector = msg?.createMessageComponentCollector({
    componentType: ComponentType.Button,
  });

  setInterval(async () => {
    const res = await db.currentGameDay.findUnique({
      where: { id: "main" },
      include: { gameDay: true },
    });

    if (
      new Date().getTime() >
      new Date(res?.gameDay?.firstMatchStart ?? "").getTime()
    ) {
      collector?.stop();
      if (withEndMessage) {
        msg?.reply("Zakończono głosowanie");
      }
    }
  }, 60 * 1000);
  const res = await db.currentGameDay.findUnique({
    where: { id: "main" },
    include: { gameDay: true },
  });

  if (
    new Date().getTime() >
    new Date(res?.gameDay?.firstMatchStart ?? "").getTime()
  ) {
    collector?.stop();
    if (withEndMessage) {
      msg?.reply("Zakończono głosowanie");
    }
  }

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

    const va = i.values[0].split("_");
    const selection = va[0];
    const score = va[1];

    const user = await db.user.upsert({
      where: { id: i.user.id },
      create: {
        id: i.user.id,
        username: i.user.tag,
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
      content: `wybrano ${r.teamCode} ${
        r.score !== "1-0" ? r.score : ""
      }`.trim(),
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
                  : `${voters[0].teamCode} ${
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
