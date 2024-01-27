import type { $Enums, Team } from '@prisma/client'
import {
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder,
} from 'discord.js'
import { getCurrentEvents } from '../api/events.api'
import type { EventT } from '../schema/events.schema'
import { db } from '../utils/db'
import { addHours } from '../utils/time'

function buildTeamSelects(events: EventT[]) {
	const selects = events.map(({ match: { id, teams, strategy } }) => {
		let options: StringSelectMenuOptionBuilder[] = []

		if (strategy.count === 1) {
			options = teams.map(({ code, name }) => {
				return new StringSelectMenuOptionBuilder()
					.setLabel(`${name} (${code})`)
					.setValue(code)
			})
		}

		if (strategy.count === 3) {
			options = teams.flatMap(({ code, name }) => {
				return [
					new StringSelectMenuOptionBuilder()
						.setLabel(`${name} (${code}) 2-0`)
						.setValue(`${code}_2-0`),
					new StringSelectMenuOptionBuilder()
						.setLabel(`${name} (${code}) 2-1`)
						.setValue(`${code}_2-1`),
				]
			})
		}

		if (strategy.count === 5) {
			options = teams.flatMap(({ code, name }) => {
				return [
					new StringSelectMenuOptionBuilder()
						.setLabel(`${name} (${code}) 3-0`)
						.setValue(`${code}_3-0`),
					new StringSelectMenuOptionBuilder()
						.setLabel(`${name} (${code}) 3-1`)
						.setValue(`${code}_3-1`),
					new StringSelectMenuOptionBuilder()
						.setLabel(`${name} (${code}) 3-2`)
						.setValue(`${code}_3-2`),
				]
			})
		}

		const select = new StringSelectMenuBuilder()
			.setCustomId(id)
			.setPlaceholder(`${teams[0].name} vs ${teams[1].name}`)
			.addOptions(options)

		return select
	})

	return selects
}

function createTeamIfNotExist({ code, image, name }: Omit<Team, 'gameIds'>) {
	return db.team.upsert({
		where: {
			code,
		},
		update: {},
		create: {
			code,
			image,
			name,
		},
	})
}

function strategyCountToEnumType(strategyCount: number): $Enums.MatchType {
	switch (strategyCount) {
		case 1:
			return 'BO1'
		case 3:
			return 'BO3'
		case 5:
			return 'BO5'
		default:
			return 'BO1'
	}
}

async function createGame(
	gameDayId: string,
	{ match: { teams, strategy }, match, startTime }: EventT
) {
	await Promise.all([
		createTeamIfNotExist({
			code: teams[0].code,
			image: teams[0].image,
			name: teams[0].name,
		}),
		createTeamIfNotExist({
			code: teams[1].code,
			image: teams[1].image,
			name: teams[1].name,
		}),
	])

	await db.game.upsert({
		where: {
			id: match.id,
		},
		create: {
			startTime,
			id: match.id,
			gameDayId,
			teamCodes: [teams[0].code, teams[1].code],
			type: strategyCountToEnumType(strategy.count),
		},
		update: {},
	})
}

function generateGameDayId(events: EventT[]) {
	// return events.map(({ match: { id } }) => id.slice(id.length - 10)).join("");
	const date = new Date(events[0].startTime)
	return `${date.getDate()}-${date.getMonth()}`
}

export async function createTeamSelects() {
	const events = await getCurrentEvents()

	const selects = buildTeamSelects(events)

	const gameDay = await db.gameDay.upsert({
		create: {
			firstMatchStart: events[0].startTime,
			id: generateGameDayId(events),
		},
		update: {},
		where: {
			id: generateGameDayId(events),
		},
		include: {
			games: true,
		},
	})

	await Promise.all(events.map((event) => createGame(gameDay.id, event)))

	await db.currentGameDay.upsert({
		create: { gameDayId: gameDay.id },
		update: { gameDayId: gameDay.id },
		where: {
			id: 'main',
		},
	})

	const startDate = events[0].startTime
	const title = events[0].blockName

	return [
		selects,
		{
			startDate,
			displayStartDate: addHours(new Date(startDate), 1)
				.toLocaleString('pl')
				.slice(0, -3),
			title,
			gameDayId: gameDay.id,
		},
	] as const
}
