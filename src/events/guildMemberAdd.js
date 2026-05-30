const { Events } = require('discord.js');
const config = require('../config');
const logger = require('../utils/logger');
const { welcomeEmbed } = require('../utils/embeds');

module.exports = {
  name: Events.GuildMemberAdd,
  async execute(member) {
    const channel = member.guild.channels.cache.get(config.welcomeChannelId);

    if (!channel) {
      logger.warn(
        `Welcome channel "${config.welcomeChannelId}" not found in "${member.guild.name}". ` +
        `Check WELCOME_CHANNEL_ID in your .env`
      );
      return;
    }

    try {
      await channel.send({ embeds: [welcomeEmbed(member)] });
      logger.info(`Welcomed ${member.user.tag} in ${member.guild.name}`);
    } catch (err) {
      logger.error(`Could not send welcome message: ${err.message}`);
    }
  },
};
