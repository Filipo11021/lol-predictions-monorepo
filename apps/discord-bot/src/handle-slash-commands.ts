import fs from 'node:fs'
import path from 'node:path'
import {
	type CacheType,
	type ChatInputCommandInteraction,
	type Client,
	Collection,
	Events,
} from 'discord.js'

export function handleSlashCommands(client: Client<boolean>) {
	const commands = collectSlashCommands()

	client.on(Events.InteractionCreate, async (interaction) => {
		if (!interaction.isChatInputCommand()) return

		const command = commands.get(interaction.commandName) as {
			execute: (i: ChatInputCommandInteraction<CacheType>) => Promise<void>
		}

		if (!command) {
			console.error(`No command matching ${interaction.commandName} was found.`)
			return
		}

		try {
			await command.execute(interaction)
		} catch (error) {
			console.error(error)
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp({
					content: 'There was an error while executing this command!',
					ephemeral: true,
				})
			} else {
				await interaction.reply({
					content: 'There was an error while executing this command!',
					ephemeral: true,
				})
			}
		}
	})
}

export function collectSlashCommands() {
	const commands = new Collection()

	const commandsPath = path.join(__dirname, './commands')
	const commandFiles = fs
		.readdirSync(commandsPath)
		.filter((file) => file.endsWith('.js'))

	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file)
		const command = require(filePath)
		// Set a new item in the Collection with the key as the command name and the value as the exported module
		if ('data' in command && 'execute' in command) {
			commands.set(command.data.name, command)
		} else {
			// biome-ignore lint/suspicious/noConsoleLog: command validation info
			console.log(
				`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
			)
		}
	}

	return commands
}
