import {
  ActionRowBuilder,
  CacheType,
  ChatInputCommandInteraction,
  ComponentType,
  Message,
  SlashCommandBuilder,
} from "discord.js";
import { createBO1Selects } from "../components/BO1Select";
import { db } from "../utils/db";

export const data = new SlashCommandBuilder()
  .setName("game")
  .setDescription("set game");

export const execute = async (
  interaction: ChatInputCommandInteraction<CacheType>
) => {
  const [selects, { title, displayStartDate, gameDayId }] =
    await createBO1Selects();

  await interaction.reply({ ephemeral: true, content: "generated games:" });

  const res = await interaction.channel?.send({
    //@ts-expect-error
    components: selects.map((select) =>
      new ActionRowBuilder().addComponents(select)
    ),
    content: `${title} - koniec głosowania: ${displayStartDate}`,
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
  msg?.awaitMessageComponent;
  const collector = msg?.createMessageComponentCollector({
    componentType: ComponentType.StringSelect,
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
    const selection = i.values[0];
    await i.reply({
      content: `${i.user} has selected ${selection}!`,
      ephemeral: true,
    });
  });
}
