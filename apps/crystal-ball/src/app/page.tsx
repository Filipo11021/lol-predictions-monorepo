import { ChooseAnswer } from '@/components/choose-answer';
import {
	$Enums,
	type Question,
	type Team,
	prisma,
	type Answer,
} from '@repo/database';
import { AppHeader } from './app-header';
import { getDiscordUserFromHeader } from '@/discord-auth/get-discord-user';
import {
	getServerLocale,
	getServerTranslation,
} from '@/i18n/get-server-translation';
import champions from '@/data/champions.json';
import players from '@/data/players.json';
import { Button } from '@repo/ui/button';

function getCrystalBallQuestions({
	category,
}: {
	category: $Enums.QuestionCategory;
}) {
	const userRes = getDiscordUserFromHeader();
	const user = userRes.ok ? userRes.data : null;
	return prisma.question.findMany({
		where: {
			eventId: $Enums.EventId.MSI_2024,
			category: category,
			type: $Enums.QuestionType.CRYSTAL_BALL,
		},
		include: {
			answers: {
				where: {
					userId: user?.id,
				},
			},
		},
	});
}

function getSelectedOptionValue({ answers }: { answers: Answer[] }) {
	const value =
		answers.length <= 0
			? undefined
			: answers[0].selectedOptions.length <= 0
			  ? undefined
			  : answers[0].selectedOptions[0];

	return value;
}

function formatOptions({
	question: { availableOptions, category },
	teams,
}: { question: Question; teams: Team[] }) {
	switch (category) {
		case 'CHAMPIONS':
			return champions;
		case 'TEAMS':
			return teams.map(({ name, code, image }) => ({
				value: code,
				title: name,
				image,
			}));
		case 'PLAYERS':
			return players.map(({ name, image, team, role }) => ({
				value: name,
				subtitle: role === 'none' ? team.code : `${team.code} - ${role}`,
				image,
			}));
		default:
			return availableOptions.map((option) => ({
				value: option,
			}));
	}
}

export default async function Home() {
	const [
		eventQuestion,
		championQuestions,
		playerQuestions,
		teamQuestions,
		teams,
	] = await Promise.all([
		getCrystalBallQuestions({ category: $Enums.QuestionCategory.EVENT }),
		getCrystalBallQuestions({ category: $Enums.QuestionCategory.CHAMPIONS }),
		getCrystalBallQuestions({ category: $Enums.QuestionCategory.PLAYERS }),
		getCrystalBallQuestions({ category: $Enums.QuestionCategory.TEAMS }),
		prisma.team.findMany({}),
	]);

	const locale = getServerLocale();
	const translation = getServerTranslation();

	return (
		<div>
			<AppHeader />
			<main className="w-full flex flex-col gap-12 p-8 max-w-[2000px] mx-auto">
				{[eventQuestion, championQuestions, playerQuestions, teamQuestions].map(
					(questions) => {
						if (!questions.length) return;

						const { category } = questions[0];

						return (
							<div className="flex flex-col gap-6">
								<h2 className="text-2xl">{category}</h2>
								<div className="grid max-w-[1800px] w-full mx-auto gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 justify-around">
									{questions.map((question) => {
										const translatedTitle = question.title[locale];
										const initialValue = getSelectedOptionValue({
											answers: question.answers,
										});

										return (
											<ChooseAnswer
												title={translatedTitle}
												options={formatOptions({ question, teams })}
												questionId={question.id}
												points={question.points}
												initialValue={initialValue}
												translation={translation.pick}
											/>
										);
									})}
								</div>
							</div>
						);
					}
				)}
				<div className="pt-6 pb-11 flex justify-center">
					<Button className="text-xl capitalize" size="lg" asChild>
						<a href="https://twitch.tv/lewus">{translation.pick.submit}</a>
					</Button>
				</div>
			</main>
		</div>
	);
}
