import { Workspace, prisma } from '@repo/database';
import { createTeamSelects } from 'components/SelectTeam';
import { collectTeamSelectResponses } from 'components/collect-team-select-responses';
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	type CacheType,
	type ChatInputCommandInteraction,
	PermissionFlagsBits,
	SlashCommandBuilder,
} from 'discord.js';

export const data = new SlashCommandBuilder()
	.setName('game')
	.setDescription('create game day')
	.setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export const execute = async (
	interaction: ChatInputCommandInteraction<CacheType>
) => {
	const [selects, { title, displayStartDate }] = await createTeamSelects();

	await interaction.reply({ ephemeral: true, content: 'generated games:' });

	const btn = new ButtonBuilder()
		.setCustomId('results')
		.setLabel('Sprawdź swoje wybory')
		.setStyle(ButtonStyle.Primary);

	const selects1 = selects.slice(0, 4);
	const selects2 = selects.slice(4, selects.length);

	const arr =
		selects2.length === 0
			? [
					...selects1.map((select) =>
						new ActionRowBuilder().addComponents(select)
					),
					new ActionRowBuilder().addComponents(btn),
				]
			: [
					...selects1.map((select) =>
						new ActionRowBuilder().addComponents(select)
					),
				];

	const res1 = await interaction.channel?.send({
		//@ts-expect-error
		components: arr,
		content: `${title} - koniec głosowania: ${displayStartDate}`,
	});

	const res2 =
		selects2.length > 0
			? await interaction.channel?.send({
					components: [
						//@ts-expect-error
						...selects2.map((select) =>
							new ActionRowBuilder().addComponents(select)
						),
						//@ts-expect-error
						new ActionRowBuilder().addComponents(btn),
					],
				})
			: undefined;

	await collectTeamSelectResponses(res1, { withEndMessage: true });
	if (res2) {
		await collectTeamSelectResponses(res2, { withEndMessage: false });
	}

	await prisma.currentGameDay.update({
		data: {
			messageId: res2?.id ? `${res1?.id}$$${res2?.id}` : res1?.id,
		},
		where: {
			id: Workspace.Main,
		},
	});
};
