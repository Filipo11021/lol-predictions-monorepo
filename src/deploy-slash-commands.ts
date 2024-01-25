import { REST, Routes } from 'discord.js'
import { env } from './env'
import { collectSlashCommands } from './handle-slash-commands'

const commands = collectSlashCommands()

const body: string[] = []
commands.forEach((command) => {
	//@ts-expect-error
	body.push(command.data.toJSON())
})

const rest = new REST().setToken(env.DISCORD_TOKEN)

// and deploy your commands!
;(async () => {
	try {
		// biome-ignore lint/suspicious/noConsoleLog: info - start refreshing commands
		console.log(`Started refreshing ${commands.size} application (/) commands.`)

		//@ts-expect-error
		// biome-ignore lint/suspicious/noConsoleLog: info - print all commands
		console.log(commands.forEach((a) => console.log(a?.data?.name)))

		// The put method is used to fully refresh all commands in the guild with the current set
		const data = await rest.put(
			Routes.applicationCommands(env.DISCORD_APP_ID),
			{ body }
		)

		console.log(
			//@ts-expect-error
			// biome-ignore lint/suspicious/noConsoleLog: info - commands reloaded
			`Successfully reloaded ${data.length} application (/) commands.`
		)
	} catch (error) {
		//@ts-expect-error
		console.error(error.rawError.errors['0'].name)
	}
})()
