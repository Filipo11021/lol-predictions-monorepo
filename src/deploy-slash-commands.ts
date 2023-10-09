import { REST, Routes } from "discord.js";
import { collectSlashCommands } from "./handle-slash-commands";
import { env } from "./env";

const commands = collectSlashCommands();

const body: string[] = [];
commands.forEach((command) => {
  //@ts-expect-error
  body.push(command.data.toJSON());
});

const rest = new REST().setToken(env.DISCORD_TOKEN);

// and deploy your commands!
(async () => {
  try {
    console.log(
      `Started refreshing ${commands.size} application (/) commands.`
    );

    console.log(commands.forEach((a) => console.log(a)));

    // The put method is used to fully refresh all commands in the guild with the current set
    const data = await rest.put(
      Routes.applicationCommands(env.DISCORD_APP_ID),
      { body }
    );

    console.log(
      //@ts-expect-error
      `Successfully reloaded ${data.length} application (/) commands.`
    );
  } catch (error) {
    //@ts-expect-error
    console.error(error.rawError.errors["0"].name);
  }
})();
