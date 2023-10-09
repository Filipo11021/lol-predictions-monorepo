import { env } from "./env";
import { Client, Events, GatewayIntentBits, ChannelType } from "discord.js";
import { handleSlashCommands } from "./handle-slash-commands";
import { db } from "./utils/db";
import { collectSelectResponses } from "./commands/create-game-day.command";

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

  const currentGameDay = await db.currentGameDay.findUnique({
    where: {
      id: "main",
    },
  });

  const msg = (await channel.messages.fetch({ limit: 10 })).find(
    ({ id }) => currentGameDay?.messageId === id
  );

  setInterval(async () => {
    const currentGameDay = await db.currentGameDay.findUnique({
      where: {
        id: "main",
      },
      include: {
        gameDay: {
          include: {
            games: {
              include: {
                voters: {
                  include: {
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

    const msg = (await channel.messages.fetch({ limit: 10 })).find(
      ({ id }) => currentGameDay?.messageId === id
    );

    const res = currentGameDay?.gameDay?.games.map(({ voters, id, teams }) =>
      voters
        .map(({ team }) => ({
          teamCode: team.code,
          teamName: team.name,
        }))
        .reduce(
          (acc, current) => {
            const result = acc.map((arg) =>
              arg.teamCode === current.teamCode
                ? { ...arg, count: arg.count + 1 }
                : arg
            );
            return result;
          },
          [
            { teamCode: teams[0].code, teamName: teams[0].name, count: 0 },
            { teamCode: teams[1].code, teamName: teams[1].name, count: 0 },
          ]
        )
    );

    const content = msg?.content.split("\n")[0];
    msg?.edit({
      content: `${content}\n${res
        ?.map(
          (teams) =>
            `${teams[0].teamCode}: ${teams[0].count} | ${teams[1].teamCode}: ${teams[1].count}`
        )
        .join("\n")}`,
    });
  }, 1000 * 32);

  collectSelectResponses(msg);

  console.log(`Ready! Logged in as ${c.user.tag}`);
});

handleSlashCommands(client);

client.login(env.DISCORD_TOKEN);
