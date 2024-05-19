import { prisma } from "@repo/database";

export async function calculateQuestionsPoints({
  user,
}: {
  user: { id: string };
}) {
  const answers = await prisma.answer.findMany({
    where: { userId: user.id, question: { type: "BONUS_QUESTION" } },
    include: { question: true },
  });

  let points = 0;

  for (const answer of answers) {
    if (answer.selectedOptions.some((el) => answer.question.correctOptions.includes(el))) {
      points += answer.question.points;
    }
  }

  return points;
}
