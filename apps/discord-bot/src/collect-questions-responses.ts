import { QuestionType, Workspace, prisma } from "@repo/database";
import { ComponentType, type TextChannel } from "discord.js";

export async function collectQuestionsResponses(channel: TextChannel) {
  const questions = await prisma.question.findMany({
    orderBy: {
      id: "asc",
    },
    where: {
      type: QuestionType.BONUS_QUESTION,
    },
  });
  const lastMessageId = questions.at(-1)?.messageId;

  const buttonMsg = (await channel.messages.fetch({ limit: 10 })).find(
    ({ id }) => lastMessageId === id
  );
  const btnCollector = buttonMsg?.createMessageComponentCollector({
    componentType: ComponentType.Button,
  });

  btnCollector?.on("collect", async (i) => {
    const answers = await prisma.answer.findMany({
      where: {
        userId: i.user.id,
        question: { type: QuestionType.BONUS_QUESTION },
      },
      orderBy: {
        questionId: "asc",
      },
    });
    i.reply({
      ephemeral: true,
      content: answers.length
        ? answers
            .map(
              ({ selectedOptions }, i) =>
                ` ${i + 1}. ${selectedOptions.join(", ")}`
            )
            .join(",")
        : "Brak",
    });
  });

  for (const question of questions) {
    const msg = (await channel.messages.fetch({ limit: 10 })).find(
      ({ id }) => question?.messageId === id
    );

    const collector = msg?.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
    });

    const intervalId = setInterval(async () => {
      const res = await prisma.current.findUnique({
        where: { id: Workspace.MAIN },
        include: { gameDay: true },
      });

      if (
        new Date().getTime() >
        new Date(res?.gameDay?.firstMatchStart ?? "").getTime()
      ) {
        collector?.stop();
        clearInterval(intervalId);
      }
    }, 60 * 1000);

    collector?.on("collect", async (i) => {
      try {
        const answer = i.values[0];

        const data = await prisma.answer.upsert({
          where: {
            id: question.id + i.user.id,
            question: { type: QuestionType.BONUS_QUESTION },
          },
          create: {
            id: question.id + i.user.id,
            selectedOptions: [answer],
            questionId: question.id,
            userId: i.user.id,
          },
          update: {
            selectedOptions: [answer],
          },
        });
        i.reply({
          content: `wybrano ${data.selectedOptions.join(", ")}`,
          ephemeral: true,
        });
      } catch (error) {
        // biome-ignore lint/suspicious/noConsoleLog: <explanation>
        console.log(error);
      }
    });
  }
}
