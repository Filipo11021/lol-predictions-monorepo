import { Workspace, prisma } from "@repo/database";
// import { collectQuestionsResponses } from 'collect-questions-responses';
import { collectTeamSelectResponses } from "components/collect-team-select-responses";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  Client,
  Events,
  GatewayIntentBits,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from "discord.js";
import { env } from "./env";
import { handleSlashCommands } from "./handle-slash-commands";

import { $Enums, } from "@repo/database";

console.log("v0.0.1");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

client.once(Events.ClientReady, async (c) => {
  const channel = client.channels.cache.get(env.DISCORD_CHANNEL_ID);
  if (channel?.type !== ChannelType.GuildText) {
    throw Error("channel type");
  }

  const questions = await prisma.question.findMany({
    orderBy: {
      id: "asc",
    },
    where: {
      type: $Enums.QuestionType.BONUS_QUESTION,
    },
  });

  const btn = new ButtonBuilder()
    .setCustomId("results")
    .setLabel("Sprawdź swoje odpowiedzi")
    .setStyle(ButtonStyle.Primary);

  for (const [i, question] of questions.entries()) {
    const select = new StringSelectMenuBuilder()
      .setCustomId(question.id)
      .setPlaceholder("Odpowiedzi")
      .addOptions(
        question.availableOptions.map((name) =>
          new StringSelectMenuOptionBuilder().setLabel(name).setValue(name)
        )
      );

    const components = [new ActionRowBuilder().addComponents(select)];

    if (i === 3) {
      components.push(new ActionRowBuilder().addComponents(btn));
    }

    const res1 = await channel?.send({
      // @ts-expect-error
      components: components,
      content: question.title.pl,
    });

    await prisma.question.update({
      where: {
        id: question.id,
      },
      data: {
        messageId: res1.id,
      },
    });
  }

  // biome-ignore lint/suspicious/noConsoleLog: bot ready info
  console.log(`Ready! Logged in as ${c.user.tag}`);
});

client.login(env.DISCORD_TOKEN);
// const q = [
//   { pl: "Kto będzie MVP finału?", en: "Kto będzie MVP finału?" },

//   {
//     pl: "Kto będzie miał łącznie najwięcej śmierci w finale?",
//     en: "Kto będzie miał łącznie najwięcej śmierci w finale?",
//   },
//   {
//     pl: "Kto będzie miał łącznie najwięcej zabójstw w finale?",
//     en: "Kto będzie miał łącznie najwięcej zabójstw w finale?",
//   },
//   {
//     pl: "Kto będzie miał największe łączne KDA w finale?",
//     en: "Kto będzie miał największe łączne KDA w finale?",
//   },
// ];

// const names = [
//   "Bin",
//   "Xun",
//   "knight",
//   "Elk",
//   "ON",
//   "Kiin",
//   "Canyon",
//   "Chovy",
//   "Peyz",
//   "Lehends",
// ];

// (async () => {
// 	await prisma.question.createMany({
// 		data: q.map(({ pl }) => ({
// 			title: { pl, en: pl },
// 			category: $Enums.QuestionCategory.PLAYERS,
// 			tournamentId: $Enums.TOURNAMENT_ID.WORLDS_2024,
// 			points: 1,
// 			availableOptions: names,
// 			type: $Enums.QuestionType.BONUS_QUESTION,
// 		})),
// 	});
// })()
