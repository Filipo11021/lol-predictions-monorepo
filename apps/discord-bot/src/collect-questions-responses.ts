import { prisma } from '@repo/database';
import { ComponentType, type TextChannel } from 'discord.js';

export async function collectQuestionsResponses(channel: TextChannel) {
	const questions = await prisma.question.findMany({});

	for (const question of questions) {
		const msg = (await channel.messages.fetch({ limit: 10 })).find(
			({ id }) => question.messageId === id
		);

		const collector = msg?.createMessageComponentCollector({
			componentType: ComponentType.StringSelect,
		});

		const intervalId = setInterval(async () => {
			const res = await prisma.currentGameDay.findUnique({
				where: { id: 'main' },
				include: { gameDay: true },
			});

			if (
				new Date().getTime() >
				new Date(res?.gameDay?.firstMatchStart ?? '').getTime()
			) {
				collector?.stop();
				clearInterval(intervalId);
			}
		}, 60 * 1000);

		collector?.on('collect', async (i) => {
			try {
				const answer = i.values[0];

				await prisma.questionAnswer.upsert({
					where: {
						id: question.id + i.user.id,
					},
					create: {
						id: question.id + i.user.id,
						answer,
						questionId: question.id,
					},
					update: {
						answer,
					},
				});
			} catch (error) {
				// biome-ignore lint/suspicious/noConsoleLog: <explanation>
				console.log(error);
			}
		});
	}
}
