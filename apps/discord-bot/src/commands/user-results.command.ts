import {
	type CacheType,
	type ChatInputCommandInteraction,
	SlashCommandBuilder,
} from 'discord.js'
import { db } from '../utils/db'

export const data = new SlashCommandBuilder()
	.setName('votes')
	.setDescription('Zobacz jak inni głosowali')
	.addUserOption((option) =>
		option
			.setName('user')
			.setRequired(true)
			.setDescription('Podaj użytkownika którego chcesz sprawdzić')
	)
	.addBooleanOption((option) =>
		option
			.setName('public')
			.setDescription(
				'czy wynik ma być publiczny czy widoczny tylko dla ciebie?'
			)
	)
	.addStringOption((option) =>
		option.setName('date').setDescription('podaj date w formacie D-M np. 23-10')
	)

export const execute = async (i: ChatInputCommandInteraction<CacheType>) => {
	const user = i.options.getUser('user')
	const isPublic = i.options.getBoolean('public')
	const gameDayId = i.options.getString('date')

	if (!user) {
		i.reply({ content: 'podaj użytkownika', ephemeral: true })
		return
	}

	const res = gameDayId
		? await db.gameDay.findUnique({
				where: {
					id: gameDayId,
				},
				include: {
					games: {
						include: {
							voters: {
								where: { userId: user.id },
								include: {
									team: true,
									user: true,
								},
							},
						},
					},
				},
		  })
		: (
				await db.currentGameDay.findUnique({
					where: { id: 'main' },
					include: {
						gameDay: {
							include: {
								games: {
									include: {
										voters: {
											where: { userId: user.id },
											include: {
												team: true,
												user: true,
											},
										},
									},
								},
							},
						},
					},
				})
		  )?.gameDay

	const a = res?.games.map(({ voters, id }) => ({
		voters: voters.map(({ team, user: { username, id }, score }) => ({
			username,
			teamCode: team.code,
			teamName: team.name,
			user_id: id,
			score,
		})),
		id,
	}))

	if (!a) {
		await i.reply({
			content: 'Brak danych',
			ephemeral: !isPublic,
		})
		return
	}

	i.reply({
		ephemeral: !isPublic,
		content: `${user.username} - ${a
			?.map(({ voters }, i) =>
				`${i + 1}. ${
					voters.length === 0
						? 'Brak'
						: `${voters[0].teamCode} ${
								voters[0].score !== '1-0' ? voters[0].score : ''
						  }`
				}`.trim()
			)
			.join(' | ')}`,
	})
}
