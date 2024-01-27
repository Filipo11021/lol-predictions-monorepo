import {
	type CacheType,
	type ChatInputCommandInteraction,
	SlashCommandBuilder,
} from 'discord.js';
import { db } from 'utils/db';

export const data = new SlashCommandBuilder()
	.setName('count')
	.setDescription('Zobacz w ilu meczach inni zagłosowali')
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
	);

export const execute = async (i: ChatInputCommandInteraction<CacheType>) => {
	const user = i.options.getUser('user');
	const isPublic = i.options.getBoolean('public');

	if (!user) {
		i.reply({ content: 'podaj użytkownika', ephemeral: true });
		return;
	}

	const [gamesCount, votesCount] = await Promise.all([
		db.game.count(),
		db.vote.count({
			where: {
				userId: user.id,
			},
		}),
	]);

	i.reply({
		ephemeral: !isPublic,
		content: `${user.username} - ${votesCount}/${gamesCount}`,
	});
};
