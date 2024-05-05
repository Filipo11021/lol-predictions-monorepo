import { ChooseAnswer } from '@/components/choose-answer';
import champions from '@/data/champions.json';
import players from '@/data/players.json';
import { getDiscordUserFromHeader } from '@/discord-auth/get-discord-user';
import {
	getServerLocale,
	getServerTranslation,
} from '@/i18n/get-server-translation';
import {
	$Enums,
	type Answer,
	type Question,
	type Team,
	prisma,
} from '@repo/database';
import { Button } from '@repo/ui/button';
import { AppHeader } from './app-header';

function getCrystalBallQuestions({
	category,
}: {
	category: $Enums.QuestionCategory;
}) {
	const userRes = getDiscordUserFromHeader();
	const user = userRes.ok ? userRes.data : null;
	return prisma.question.findMany({
		where: {
			tournamentId: $Enums.TOURNAMENT_ID.MSI_2024,
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
			return champions.map(({ id, name }) => {
				return {
					value: name,
					image: `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${id}_0.jpg`,
					icon: `https://ddragon.leagueoflegends.com/cdn/14.8.1/img/champion/${id}.png`,
				};
			});
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
			<main className="mx-auto flex w-full max-w-[2000px] flex-col gap-12 p-8">
				{[eventQuestion, championQuestions, playerQuestions, teamQuestions].map(
					(questions) => {
						if (!questions.length) return;

						const { category } = questions[0];

						return (
							<div key={category} className="flex flex-col gap-6">
								<h2 className="text-2xl">{category}</h2>
								<div className="mx-auto grid w-full max-w-[1800px] grid-cols-1 justify-around gap-8 lg:grid-cols-3 md:grid-cols-2 xl:grid-cols-5">
									{questions.map((question) => {
										const translatedTitle = question.title[locale];
										const initialValue = getSelectedOptionValue({
											answers: question.answers,
										});

										return (
											<ChooseAnswer
												key={question.id}
												title={translatedTitle}
												options={formatOptions({ question, teams })}
												questionId={question.id}
												points={question.points}
												initialValue={initialValue}
												translation={translation.pick}
												isContain={question.category === 'TEAMS'}
											/>
										);
									})}
								</div>
							</div>
						);
					}
				)}
				<div className="flex justify-center pt-6 pb-11">
					<Button className="text-xl capitalize" size="lg" asChild>
						<a href="https://twitch.tv/lewus">{translation.pick.submit}</a>
					</Button>
				</div>
			</main>
		</div>
	);
}
