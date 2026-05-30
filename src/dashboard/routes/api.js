const { Router, json } = require('express');
const { EmbedBuilder, ChannelType } = require('discord.js');
const fs   = require('fs');
const path = require('path');
const config = require('../../config');
const logger = require('../../utils/logger');
const { reactionRolesEmbed } = require('../../utils/embeds');

const reactionRolesPath  = path.join(__dirname, '../../data/reactionRoles.json');
const welcomeConfigPath  = path.join(__dirname, '../../data/welcomeConfig.json');

function readJSON(filePath) {
  try { return JSON.parse(fs.readFileSync(filePath, 'utf8')); }
  catch { return {}; }
}

function writeJSON(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

module.exports = function apiRoutes(client) {
  const router = Router();

  // Helper: get the first guild (single-server bot)
  function getGuild() {
    const guild = client.guilds.cache.first();
    if (!guild) throw new Error('Bot is not in any guild');
    return guild;
  }

  // ── GET /api/me ────────────────────────────────────────────────────────────
  router.get('/me', (req, res) => res.json(req.session.user));

  // ── GET /api/guild ──────────────────────────────────────────────────────────
  router.get('/guild', (req, res) => {
    try {
      const guild = getGuild();
      const channels = guild.channels.cache
        .filter(c => c.type === ChannelType.GuildText)
        .map(c => ({ id: c.id, name: c.name, position: c.rawPosition }))
        .sort((a, b) => a.position - b.position);

      res.json({
        name:        guild.name,
        icon:        guild.iconURL() || null,
        memberCount: guild.memberCount,
        channels,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // ── GET /api/config ─────────────────────────────────────────────────────────
  router.get('/config', (req, res) => {
    const wc = readJSON(welcomeConfigPath);
    res.json({
      welcomeChannelId:     wc.channelId     || config.welcomeChannelId     || null,
      welcomeMessage:       wc.customMessage || null,
      announcementChannelId: config.announcementChannelId || null,
    });
  });

  // ── POST /api/config/welcome ────────────────────────────────────────────────
  router.post('/config/welcome', (req, res) => {
    const { channelId, customMessage } = req.body;
    if (!channelId) return res.status(400).json({ error: 'channelId is required' });

    try {
      const guild   = getGuild();
      const channel = guild.channels.cache.get(channelId);
      if (!channel) return res.status(404).json({ error: 'Channel not found' });

      const wc = readJSON(welcomeConfigPath);
      wc.channelId = channelId;
      if (customMessage !== undefined) wc.customMessage = customMessage || null;
      writeJSON(welcomeConfigPath, wc);

      logger.info(`Welcome config updated by dashboard — channel: #${channel.name}`);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // ── POST /api/announce ──────────────────────────────────────────────────────
  router.post('/announce', async (req, res) => {
    const { channelId, title, message } = req.body;
    if (!channelId || !title || !message)
      return res.status(400).json({ error: 'channelId, title, and message are required' });

    try {
      const guild   = getGuild();
      const channel = guild.channels.cache.get(channelId);
      if (!channel) return res.status(404).json({ error: 'Channel not found' });

      const { user } = req.session;
      const embed = new EmbedBuilder()
        .setColor(0xFEE75C)
        .setTitle(title)
        .setDescription(message)
        .setAuthor({ name: user.globalName, iconURL: user.avatar })
        .setTimestamp();

      await channel.send({ embeds: [embed] });
      logger.info(`Announcement sent to #${channel.name} via dashboard by ${user.username}`);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // ── GET /api/reaction-roles ─────────────────────────────────────────────────
  router.get('/reaction-roles', (req, res) => {
    res.json({
      configured: config.reactionRoles,
      active:     readJSON(reactionRolesPath),
    });
  });

  // ── POST /api/reaction-roles/setup ─────────────────────────────────────────
  router.post('/reaction-roles/setup', async (req, res) => {
    const { channelId } = req.body;
    if (!channelId) return res.status(400).json({ error: 'channelId is required' });

    const validRoles = config.reactionRoles.filter(r => r.roleId);
    if (!validRoles.length)
      return res.status(400).json({ error: 'No roles configured — add ROLE_*_ID values to .env' });

    try {
      const guild   = getGuild();
      const channel = guild.channels.cache.get(channelId);
      if (!channel) return res.status(404).json({ error: 'Channel not found' });

      const message = await channel.send({ embeds: [reactionRolesEmbed(validRoles)] });
      for (const entry of validRoles) {
        await message.react(entry.emoji).catch(() => {});
      }

      const data = readJSON(reactionRolesPath);
      data[message.id] = Object.fromEntries(validRoles.map(r => [r.emoji, r.roleId]));
      writeJSON(reactionRolesPath, data);

      logger.info(`Reaction roles posted to #${channel.name} via dashboard (msg: ${message.id})`);
      res.json({ success: true, messageId: message.id });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};
