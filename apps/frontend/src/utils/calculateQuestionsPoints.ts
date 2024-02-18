import { prisma } from '@repo/database';

export async function calculateQuestionsPoints({
	user,
}: { user: { id: string } }) {
	const answers = await prisma.questionAnswer.findMany({
		where: { userId: user.id },
		include: { question: true },
	});

	let points = 0;

	for (const answer of answers) {
		if (answer.question.correctAnswer.includes(answer.answer)) {
			points += answer.question.points;
		}
	}

	return points;
}
