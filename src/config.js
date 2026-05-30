require('dotenv').config();

module.exports = {
  token:                process.env.BOT_TOKEN,
  clientId:             process.env.CLIENT_ID,
  // Set GUILD_ID for instant guild-scoped command registration during development.
  // Remove it (or leave blank) to register commands globally (takes ~1 hour to propagate).
  guildId:              process.env.GUILD_ID || null,

  welcomeChannelId:     process.env.WELCOME_CHANNEL_ID,
  announcementChannelId: process.env.ANNOUNCEMENT_CHANNEL_ID,

  // ── Dashboard ────────────────────────────────────────────────────────────
  clientSecret:          process.env.CLIENT_SECRET,
  dashboardSecret:       process.env.DASHBOARD_SECRET || 'change_this_in_production',
  dashboardPort:         parseInt(process.env.DASHBOARD_PORT) || 3000,
  dashboardCallbackUrl:  process.env.DASHBOARD_CALLBACK_URL || 'http://localhost:3000/auth/callback',
  // Comma-separated Discord user IDs allowed to log into the dashboard.
  // Leave blank to allow ANY Discord user (not recommended for production).
  adminIds:              process.env.ADMIN_IDS || '',

  // ── Reaction role definitions ────────────────────────────────────────────
  // Add/remove entries here, then re-run /setup-reaction-roles in your server.
  reactionRoles: [
    { emoji: '🎮', label: 'Gamer',         roleId: process.env.ROLE_GAMER_ID },
    { emoji: '💻', label: 'Developer',     roleId: process.env.ROLE_DEVELOPER_ID },
    { emoji: '📢', label: 'Announcements', roleId: process.env.ROLE_ANNOUNCEMENTS_ID },
  ],
};
