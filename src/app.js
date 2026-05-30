const { Client, GatewayIntentBits, Partials, Collection } = require('discord.js');
const fs   = require('fs');
const path = require('path');
const config = require('./config');
const logger = require('./utils/logger');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,          // Privileged — enable in Dev Portal
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,        // Privileged — enable in Dev Portal
    GatewayIntentBits.GuildMessageReactions,
  ],
  partials: [
    // Required to receive reactions on messages that were sent before the bot started
    Partials.Message,
    Partials.Channel,
    Partials.Reaction,
    Partials.User,
    Partials.GuildMember,
  ],
});

client.commands = new Collection();

// ── Load commands ────────────────────────────────────────────────────────────
const commandsPath = path.join(__dirname, 'commands');
for (const file of fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'))) {
  const command = require(path.join(commandsPath, file));
  if (command.data && command.execute) {
    client.commands.set(command.data.name, command);
  } else {
    logger.warn(`Skipping ${file} — missing data or execute export`);
  }
}

// ── Load events ──────────────────────────────────────────────────────────────
const eventsPath = path.join(__dirname, 'events');
for (const file of fs.readdirSync(eventsPath).filter(f => f.endsWith('.js'))) {
  const event = require(path.join(eventsPath, file));
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}

client.login(config.token);

// Start the web dashboard (runs in the same process so it can use the client directly)
require('./dashboard/server')(client);
