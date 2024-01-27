import { ComponentType, type Message } from 'discord.js'
import { db } from '../utils/db'

export async function collectTeamSelectResponses(
	msg: Message | undefined,
	{ withEndMessage = true }: { withEndMessage: boolean }
) {
	if (!msg) return

	const collector = msg?.createMessageComponentCollector({
		componentType: ComponentType.StringSelect,
	})
	const btnCollector = msg?.createMessageComponentCollector({
		componentType: ComponentType.Button,
	})

	const intervalId = setInterval(async () => {
		const res = await db.currentGameDay.findUnique({
			where: { id: 'main' },
			include: { gameDay: true },
		})

		if (
			new Date().getTime() >
			new Date(res?.gameDay?.firstMatchStart ?? '').getTime()
		) {
			collector?.stop()
			clearInterval(intervalId)
			if (withEndMessage) {
				msg?.reply('Zakończono głosowanie')
			}
		}
	}, 60 * 1000)
	const res = await db.currentGameDay.findUnique({
		where: { id: 'main' },
		include: { gameDay: true },
	})

	if (
		new Date().getTime() >
		new Date(res?.gameDay?.firstMatchStart ?? '').getTime()
	) {
		collector?.stop()
		clearInterval(intervalId)
		if (withEndMessage) {
			msg?.reply('Zakończono głosowanie')
		}
	}

	collector?.on('collect', async (i) => {
		const id = i.customId

		const va = i.values[0].split('_')
		const selection = va[0]
		const score = va[1]

		await db.user.upsert({
			where: { id: i.user.id },
			create: {
				id: i.user.id,
				username: i.user.tag,
			},
			update: {},
		})

		try {
			const role = i?.guild?.roles.cache.get('1195437562450427999')
			if (!Array.isArray(i.member?.roles) && !!role) {
				i.member?.roles?.add(role)
			}
		} catch {}

		const r = await db.vote.upsert({
			where: {
				id: id + i.user.id,
			},
			create: {
				id: id + i.user.id,
				gameId: id,
				userId: i.user.id,
				teamCode: selection,
				score,
			},
			update: {
				teamCode: selection,
				score,
			},
		})
		await i.reply({
			content: `wybrano ${r.teamCode} ${
				r.score !== '1-0' ? r.score : ''
			}`.trim(),
			ephemeral: true,
		})
	})

	btnCollector?.on('collect', async (i) => {
		const id = i.customId

		if (id === 'results') {
			const res = await db.currentGameDay.findUnique({
				where: { id: 'main' },
				include: {
					gameDay: {
						include: {
							games: {
								include: {
									voters: {
										where: { userId: i.user.id },
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
			const a = res?.gameDay?.games.map(({ voters, id }) => ({
				voters: voters.map(({ team, user: { username, id }, score }) => ({
					username,
					teamCode: team.code,
					teamName: team.name,
					user_id: id,
					score,
				})),
				id,
			}))

			i.reply({
				ephemeral: true,
				content: a
					?.map(
						({ voters }, i) =>
							`${i + 1}. ${
								voters.length === 0
									? 'Brak'
									: `${voters[0].teamCode} ${
											voters[0].score !== '1-0' ? voters[0].score : ''
									  }`.trim()
							}`
					)
					.join(' | '),
			})
			return
		}
	})
}
