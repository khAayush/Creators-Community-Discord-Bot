const { Events } = require('discord.js');
const fs   = require('fs');
const path = require('path');
const config = require('../config');
const logger = require('../utils/logger');
const { welcomeEmbed } = require('../utils/embeds');

const welcomeConfigPath = path.join(__dirname, '../data/welcomeConfig.json');

function readWelcomeConfig() {
  try { return JSON.parse(fs.readFileSync(welcomeConfigPath, 'utf8')); }
  catch { return {}; }
}

module.exports = {
  name: Events.GuildMemberAdd,
  async execute(member) {
    // Dashboard settings take precedence over .env values
    const wc        = readWelcomeConfig();
    const channelId = wc.channelId || config.welcomeChannelId;
    const channel   = member.guild.channels.cache.get(channelId);

    if (!channel) {
      logger.warn(`Welcome channel "${channelId}" not found. Set it in the dashboard or check WELCOME_CHANNEL_ID in .env`);
      return;
    }

    try {
      await channel.send({ embeds: [welcomeEmbed(member, wc.customMessage || null)] });
      logger.info(`Welcomed ${member.user.tag} in ${member.guild.name}`);
    } catch (err) {
      logger.error(`Could not send welcome message: ${err.message}`);
    }
  },
};
