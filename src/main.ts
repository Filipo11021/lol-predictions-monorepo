import { env } from "./env";
import { Client, Events, GatewayIntentBits, ChannelType } from "discord.js";
import { handleSlashCommands } from "./handle-slash-commands";
import { db } from "./utils/db";
import { collectSelectResponses } from "./commands/create-game-day.command";
import { $Enums } from "@prisma/client";

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
      ({ id }) => currentGameDay?.messageId?.split("$$")[0] === id
    );

    const res = currentGameDay?.gameDay?.games.map(
      ({ voters, id, teams, type }) =>
        voters
          .map(({ team, score }) => ({
            teamCode: team.code,
            teamName: team.name,
            score: score,
          }))
          .reduce(
            (acc, current) => {
              const result = acc.map((arg) =>
                arg.teamCode === current.teamCode
                  ? {
                      ...arg,
                      //@ts-expect-error
                      count: { [current.score]: (arg.count[current.score] ?? 0) + 1 },
                    }
                  : arg
              );
              return result;
            },
            [
              { teamCode: teams[0].code, teamName: teams[0].name, count: {} },
              { teamCode: teams[1].code, teamName: teams[1].name, count: {} },
            ]
          )
    );

    function formatDisplay(
      teams: {
        teamCode: string;
        teamName: string;
        count: {};
      }[]
    ) {
      let text = "";

      teams.forEach(({ teamCode, count }) => {
        text += `${teamCode}: `;
        Object.keys(count).forEach((key) => {
          //@ts-expect-error
          text += `${key} ${count[key]} | `;
        });
      });

      return text
    }

    const content = msg?.content.split("\n")[0];
    msg?.edit({
      content: `${content}\n${res
        ?.map((teams) => formatDisplay(teams))
        .join("\n")}`,
    });
  }, 1000 * 28);

  const msg1 = (await channel.messages.fetch({ limit: 10 })).find(
    ({ id }) => currentGameDay?.messageId?.split("$$")[0] === id
  );
  const msg2 = (await channel.messages.fetch({ limit: 10 })).find(
    ({ id }) => currentGameDay?.messageId?.split("$$")[1] === id
  );
  collectSelectResponses(msg1, { withEndMessage: true });
  if (msg2) {
    collectSelectResponses(msg2, { withEndMessage: false });
  }

  console.log(`Ready! Logged in as ${c.user.tag}`);
});

handleSlashCommands(client);

client.login(env.DISCORD_TOKEN);
