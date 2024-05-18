import { Workspace, prisma } from '@repo/database';
import { collectTeamSelectResponses } from 'components/collect-team-select-responses';
import { ChannelType, Client, Events, GatewayIntentBits } from 'discord.js';
import { env } from './env';
import { handleSlashCommands } from './handle-slash-commands';
import { collectQuestionsResponses } from 'collect-questions-responses';

console.log("v0.0.1")

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
	],
});

client.once(Events.ClientReady, async (c) => {
	const channel = client.channels.cache.get(env.DISCORD_CHANNEL_ID);
	if (channel?.type !== ChannelType.GuildText) {
		throw Error('channel type');
	}

	const current = await prisma.current.findUnique({
		where: {
			id: Workspace.MAIN,
		},
	});

	setInterval(async () => {
		const current = await prisma.current.findUnique({
			where: {
				id: Workspace.MAIN,
			},
			include: {
				gameDay: {
					include: {
						games: {
							include: {
								voters: {
									include: {
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

		const msg = (await channel.messages.fetch({ limit: 10 })).find(
			({ id }) => current?.messageId?.split('$$')[0] === id
		);

		const res = current?.gameDay?.games.map(({ voters, teams }) =>
			voters
				.map(({ team, score }) => ({
					teamCode: team.code,
					teamName: team.name,
					score: score,
				}))
				.reduce(
					(acc, current) => {
						const result = acc.map((arg) =>
							arg.teamCode === current.teamCode
								? {
										...arg,
										count: {
											...arg.count,
											//@ts-expect-error
											[current.score]: (arg.count?.[current.score] ?? 0) + 1,
										},
									}
								: arg
						);
						return result;
					},
					[
						{ teamCode: teams[0].code, teamName: teams[0].name, count: {} },
						{ teamCode: teams[1].code, teamName: teams[1].name, count: {} },
					]
				)
		);

		function formatDisplay(
			teams: {
				teamCode: string;
				teamName: string;
				count: object;
			}[]
		) {
			let text = '';

			teams.forEach(({ teamCode, count }, i) => {
				text += `${i !== 0 ? '\n' : ''}${teamCode}: `;

				Object.keys(count).forEach((key, i) => {
					//@ts-expect-error
					text += `${key?.replace('-', ':')} - ${count[key]} `;

					if (Object.keys(count).length - 1 !== i) {
						text += '| ';
					}
				});
			});

			return text;
		}

		//TODO change for bo3 and bo5
		// function formatBo1(
		// 	teams: {
		// 		teamCode: string;
		// 		teamName: string;
		// 		count: object;
		// 	}[]
		// ) {
		// 	let text = '';

		// 	teams.forEach(({ teamCode, count }, i) => {
		// 		text += `${i !== 0 ? ' - ' : ''}${teamCode}: `;

		// 		Object.keys(count).forEach((key, i) => {
		// 			//@ts-expect-error
		// 			text += count[key];

		// 			if (Object.keys(count).length - 1 !== i) {
		// 				text += '| ';
		// 			}
		// 		});

		// 		if (Object.keys(count).length === 0) {
		// 			text += 0;
		// 		}
		// 	});

		// 	return text;
		// }

		const content = msg?.content.split('\n')[0];
		msg?.edit({
			content: `${content}\n${res
				?.map((teams) => formatDisplay(teams))
				.join('\n')}`,
		});
	}, 1000 * 28);

	const msg1 = (await channel.messages.fetch({ limit: 10 })).find(
		({ id }) => current?.messageId?.split('$$')[0] === id
	);
	const msg2 = (await channel.messages.fetch({ limit: 10 })).find(
		({ id }) => current?.messageId?.split('$$')[1] === id
	);
	collectTeamSelectResponses(msg1, { withEndMessage: true });
	if (msg2) {
		collectTeamSelectResponses(msg2, { withEndMessage: false });
	}

	collectQuestionsResponses(channel);

	// biome-ignore lint/suspicious/noConsoleLog: bot ready info
	console.log(`Ready! Logged in as ${c.user.tag}`);
});

handleSlashCommands(client);

client.login(env.DISCORD_TOKEN);
