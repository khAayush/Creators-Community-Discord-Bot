const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('../config');
const logger = require('../utils/logger');
const { announcementEmbed } = require('../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('announce')
    .setDescription('Post a formatted announcement to the announcements channel')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption(opt =>
      opt.setName('title')
        .setDescription('Announcement title')
        .setRequired(true)
        .setMaxLength(256))
    .addStringOption(opt =>
      opt.setName('message')
        .setDescription('Announcement body')
        .setRequired(true)
        .setMaxLength(4000)),

  async execute(interaction) {
    const title   = interaction.options.getString('title');
    const message = interaction.options.getString('message');

    const channel = interaction.guild.channels.cache.get(config.announcementChannelId);
    if (!channel) {
      return interaction.reply({
        content: 'Announcement channel not found. Check `ANNOUNCEMENT_CHANNEL_ID` in your .env file.',
        ephemeral: true,
      });
    }

    try {
      await channel.send({ embeds: [announcementEmbed(title, message, interaction.user)] });
      await interaction.reply({ content: `Announcement posted to ${channel}!`, ephemeral: true });
      logger.info(`/announce used by ${interaction.user.tag} in ${interaction.guild.name}`);
    } catch (err) {
      logger.error(`Failed to post announcement: ${err.message}`);
      await interaction.reply({ content: 'Failed to post the announcement.', ephemeral: true });
    }
  },
};
