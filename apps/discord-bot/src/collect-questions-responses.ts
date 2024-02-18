import { prisma } from '@repo/database';
import { ComponentType, type TextChannel } from 'discord.js';

export async function collectQuestionsResponses(channel: TextChannel) {
	const questions = await prisma.question.findMany({});
	const lastMessageId = questions.at(-1)?.messageId;

	const buttonMsg = (await channel.messages.fetch({ limit: 10 })).find(
		({ id }) => lastMessageId === id
	);
	const btnCollector = buttonMsg?.createMessageComponentCollector({
		componentType: ComponentType.Button,
	});

	btnCollector?.on('collect', async (i) => {
		const answers = await prisma.questionAnswer.findMany({
			where: { userId: i.user.id },
			orderBy: {
				questionId: 'asc',
			},
		});
		i.reply({
			ephemeral: true,
			content: answers.length
				? answers.map(({ answer }, i) => ` ${i + 1}. ${answer}`).join(',')
				: 'Brak',
		});
	});

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
						userId: i.user.id,
					},
					update: {
						answer,
					},
				});
				i.reply({});
			} catch (error) {
				// biome-ignore lint/suspicious/noConsoleLog: <explanation>
				console.log(error);
			}
		});
	}
}
