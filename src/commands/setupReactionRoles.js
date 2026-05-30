const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs   = require('fs');
const path = require('path');
const config = require('../config');
const logger = require('../utils/logger');
const { reactionRolesEmbed } = require('../utils/embeds');

const dataPath = path.join(__dirname, '../data/reactionRoles.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup-reaction-roles')
    .setDescription('Post the role-selection message in this channel')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    const validRoles = config.reactionRoles.filter(r => r.roleId);

    if (validRoles.length === 0) {
      return interaction.reply({
        content: 'No reaction roles are configured. Add `ROLE_*_ID` values to your .env file.',
        ephemeral: true,
      });
    }

    // Defer so we have time to send the embed and add all reactions
    await interaction.deferReply({ ephemeral: true });

    let message;
    try {
      message = await interaction.channel.send({ embeds: [reactionRolesEmbed(validRoles)] });
    } catch (err) {
      logger.error(`Failed to send reaction roles message: ${err.message}`);
      return interaction.editReply({ content: 'Failed to post the role selection message.' });
    }

    // Add the configured emoji reactions one by one (order matters for display)
    for (const entry of validRoles) {
      try {
        await message.react(entry.emoji);
      } catch (err) {
        logger.warn(`Could not add reaction ${entry.emoji}: ${err.message}`);
      }
    }

    // Persist message ID → { emoji: roleId } so reaction events know what to handle
    let data = {};
    try { data = JSON.parse(fs.readFileSync(dataPath, 'utf8')); } catch { /* first run */ }

    data[message.id] = Object.fromEntries(validRoles.map(r => [r.emoji, r.roleId]));
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

    logger.info(`Reaction roles set up by ${interaction.user.tag} (msg: ${message.id})`);
    await interaction.editReply({
      content: `Role selection message posted! Message ID: \`${message.id}\``,
    });
  },
};
