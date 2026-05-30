const { Events, REST, Routes } = require('discord.js');
const config = require('../config');
const logger = require('../utils/logger');

module.exports = {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    logger.success(`Logged in as ${client.user.tag}`);

    // Build the command payload from the already-loaded Collection
    const body = [...client.commands.values()].map(cmd => cmd.data.toJSON());

    const rest  = new REST().setToken(config.token);
    const route = config.guildId
      ? Routes.applicationGuildCommands(config.clientId, config.guildId)
      : Routes.applicationCommands(config.clientId);

    try {
      await rest.put(route, { body });
      const scope = config.guildId ? `guild ${config.guildId}` : 'globally';
      logger.success(`Registered ${body.length} slash command(s) ${scope}`);
    } catch (err) {
      logger.error(`Slash command registration failed: ${err.message}`);
    }
  },
};
