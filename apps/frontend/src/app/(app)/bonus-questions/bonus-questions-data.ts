import { prisma } from "@repo/database";
import {
  BonusQuestionsData,
  BonusQuestionsInfo,
} from "./bonus-questions-columns";

function getResult({
	correctOptions,
  selectedOptions
}: {
  selectedOptions?: string[];
	correctOptions?: string[];
}): 'won' | 'lose' | 'unfinished' {
	if (!selectedOptions || !correctOptions) return 'unfinished';

  if (selectedOptions.some((el) => correctOptions.includes(el))) return 'won'

  return 'lose'
}

async function getQuestions(arg: { type: "all" }) {
  return prisma.question.findMany({
    include: {
      answers: {
        include: { user: true },
      },
    },
    where: {
      type: 'BONUS_QUESTION',
    },
  });
}

export async function bonusQuestionsTableData(arg: { type: "all" }): Promise<{
  tableData: Array<BonusQuestionsData>;
  tableInfo: BonusQuestionsInfo;
}> {
  const [data] = await Promise.all([getQuestions(arg)]);

  if (!data) throw Error("unknown questions data");

  const sortedQuestions = data;

  const tableData: Record<PropertyKey, BonusQuestionsData> = {};
  const tableInfo: BonusQuestionsInfo = {};

  sortedQuestions?.forEach((question) => {
    tableInfo[`questionId-${question.id}`] = {
      title: question.title.pl,
      correctOptions: question.correctOptions,
    };

    question.answers.forEach((answer) => {
      const result = getResult({
        correctOptions: question.correctOptions,
        selectedOptions: answer.selectedOptions,
      });

      const points = result === "won" ? question.points : 0;

      if (!answer.user) return

      if (!tableData[answer.user.username]) {
        tableData[answer.user.username] = {
          username: answer.user.username,
          points: points as number,
        };
        tableData[answer.user.username][`questionId-${question.id}`] =
          answer.selectedOptions;

        return;
      }

      tableData[answer.user.username].points += points;
      tableData[answer.user.username][`questionId-${question.id}`] =
        answer.selectedOptions;
    });
  });

  return { tableData: Object.values(tableData), tableInfo };
}
