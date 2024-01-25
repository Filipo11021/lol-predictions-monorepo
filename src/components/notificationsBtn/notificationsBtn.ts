import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	type Client,
	ComponentType,
	type Message,
} from 'discord.js'
import { db } from '../../utils/db'

const addNotifyRoleKey = 'addNotifyRole'
const removeNotifyRoleKey = 'removeNotifyRole'

const positiveBtn = new ButtonBuilder()
	.setCustomId(addNotifyRoleKey)
	.setLabel('Tak')
	.setStyle(ButtonStyle.Success)
const negativeBtn = new ButtonBuilder()
	.setCustomId(removeNotifyRoleKey)
	.setLabel('Nie')
	.setStyle(ButtonStyle.Danger)

export const actionRowNotify = new ActionRowBuilder({
	components: [positiveBtn, negativeBtn],
})

export async function interaction(client: Client<boolean>) {
	const info = await db.info.findUnique({ where: { id: 'main' } })
	if (!info?.notifyCheckMessageId) return

	const channel = client.channels.cache.get(info.id)
	if (!channel?.isTextBased()) return
	const msg = await channel.messages.fetch(info.notifyCheckMessageId)

	collector(msg)
}

function collector(msg: Message) {
	const btnCollector = msg?.createMessageComponentCollector({
		componentType: ComponentType.Button,
	})

	btnCollector.on('collect', (i) => {
		if (i.customId === addNotifyRoleKey) {
		} else if (i.customId === removeNotifyRoleKey) {
		}
	})
}

export async function create(client: Client<boolean>) {
	const channelId = '1160729179181043882'
	const channel = client.channels.cache.get(channelId)
	if (!channel?.isTextBased()) return

	const msg = await channel?.send({
		//@ts-expect-error
		components: [actionRowNotify],
		content: 'Czy chcesz dostawać powiadomienia dotyczące predykcji?',
	})

	await db.info.upsert({
		where: {
			id: 'main',
		},
		create: {
			id: 'main',
			notifyCheckMessageChannel: channelId,
			notifyCheckMessageId: msg.id,
		},
		update: {
			notifyCheckMessageChannel: channelId,
			notifyCheckMessageId: msg.id,
		},
	})

	collector(msg)
}
