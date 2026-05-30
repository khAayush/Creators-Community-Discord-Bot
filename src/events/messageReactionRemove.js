const { Events } = require('discord.js');
const fs   = require('fs');
const path = require('path');
const logger = require('../utils/logger');

const dataPath = path.join(__dirname, '../data/reactionRoles.json');

function readData() {
  try {
    return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  } catch {
    return {};
  }
}

module.exports = {
  name: Events.MessageReactionRemove,
  async execute(reaction, user) {
    if (user.bot) return;

    if (reaction.partial) {
      try { await reaction.fetch(); }
      catch (err) { logger.error(`Failed to fetch reaction partial: ${err.message}`); return; }
    }
    if (reaction.message.partial) {
      try { await reaction.message.fetch(); }
      catch (err) { logger.error(`Failed to fetch message partial: ${err.message}`); return; }
    }

    const mapping = readData()[reaction.message.id];
    if (!mapping) return;

    const roleId = mapping[reaction.emoji.name];
    if (!roleId) return;

    const guild  = reaction.message.guild;
    const member = await guild.members.fetch(user.id).catch(() => null);
    if (!member) return;

    const role = guild.roles.cache.get(roleId);
    if (!role) {
      logger.warn(`Role ${roleId} not found — update ROLE_*_ID in .env`);
      return;
    }

    if (role.position >= guild.members.me.roles.highest.position) {
      logger.warn(`Cannot remove "${role.name}" — move the bot role above it in Server Settings → Roles`);
      return;
    }

    try {
      await member.roles.remove(role);
      logger.info(`-role "${role.name}" → ${user.tag}`);
    } catch (err) {
      logger.error(`Failed to remove role: ${err.message}`);
    }
  },
};
