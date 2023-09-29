import { env } from "./env";
import {
  Client,
  Events,
  GatewayIntentBits,
  ActionRowBuilder,
  ComponentType,
  ChannelType,
} from "discord.js";
import { createBO1Selects } from "./components/BO1Select";
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

  const msg = (await channel.messages.fetch({ limit: 20 })).find(
    ({ id }) => currentGameDay?.messageId === id
  );

  collectSelectResponses(msg);

  console.log(`Ready! Logged in as ${c.user.tag}`);
});

handleSlashCommands(client);

client.login(env.DISCORD_TOKEN);
