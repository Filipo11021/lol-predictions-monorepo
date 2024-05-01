import fs from 'node:fs';
import { $Enums, Workspace, prisma } from '@repo/database';
import {
	type CacheType,
	type ChatInputCommandInteraction,
	PermissionFlagsBits,
	SlashCommandBuilder,
} from 'discord.js';

export const data = new SlashCommandBuilder()
	.setName('collect')
	.setDescription('collect all results')
	.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
	.addBooleanOption((option) =>
		option
			.setName('public')
			.setDescription(
				'czy wynik ma być publiczny czy widoczny tylko dla ciebie?'
			)
	)
	.addStringOption((option) =>
		option.setName('date').setDescription('Podaj date w formacie D-M np. 23-10')
	);

export const execute = async (
	interaction: ChatInputCommandInteraction<CacheType>
) => {
	const isPublic = interaction.options.getBoolean('public');
	const gameDayId = interaction.options.getString('date');

	await interaction.deferReply({ ephemeral: !isPublic });

	const dataPromise = gameDayId
		? await prisma.gameDay.findUnique({
				where: { id: gameDayId },
				include: {
					games: {
						include: {
							voters: {
								include: {
									user: {
										include: {
											_count: {
												select: {
													votes: true,
												},
											},
										},
									},
									team: true,
								},
							},
							teams: true,
						},
					},
				},
			})
		: prisma.current.findUnique({
				where: { id: Workspace.MAIN },
				include: {
					gameDay: {
						include: {
							games: {
								include: {
									voters: {
										include: {
											user: {
												include: {
													_count: {
														select: {
															votes: true,
														},
													},
												},
											},
											team: true,
										},
									},
									teams: true,
								},
							},
						},
					},
				},
			});

	const [data, allCount] = await Promise.all([
		dataPromise,
		prisma.game.count(),
	]);

	if (!data) {
		await interaction.editReply({
			content: 'Brak danych',
		});
		return;
	}

	const result = ('gameDay' in data ? data.gameDay : data)?.games.map(
		({ voters, teams, id, type }) => ({
			all_votes_count: allCount,
			voters: voters.map(({ team, user: { username, id, _count }, score }) => ({
				votes_count: _count.votes,
				username,
				teamCode: team.code,
				teamName: team.name,
				user_id: id,
				score,
			})),
			teams: teams.map(({ code, name, image }) => ({ code, name, image })),
			type: type ?? $Enums.MatchType.BO3,
			id,
		})
	);

	if (!result) {
		await interaction.editReply({
			content: 'Brak danych',
		});
		return;
	}

	const date = new Date();
	const fileName = `results_${date.getHours()}-${date.getMinutes()}_${date.getDate()}.${date.getMonth()}.${date.getFullYear()}.json`;

	fs.writeFileSync(fileName, JSON.stringify(result), { encoding: 'utf8' });

	await interaction.editReply({
		files: [fileName],
	});

	fs.unlinkSync(fileName);
};
