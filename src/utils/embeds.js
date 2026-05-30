const { EmbedBuilder } = require('discord.js');

module.exports = {
  welcomeEmbed(member) {
    return new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle(`Welcome to ${member.guild.name}! 🎉`)
      .setDescription(
        `Hey ${member}, we're glad you're here!\n\n` +
        `Please read the rules and enjoy your stay.`
      )
      .setThumbnail(member.user.displayAvatarURL())
      .setFooter({ text: `Member #${member.guild.memberCount}` })
      .setTimestamp();
  },

  reactionRolesEmbed(roles) {
    const lines = roles.map(r => `${r.emoji}  —  **${r.label}**`).join('\n');
    return new EmbedBuilder()
      .setColor(0x57F287)
      .setTitle('🎭 Role Selection')
      .setDescription('React below to receive or remove a role:\n\n' + lines)
      .setFooter({ text: 'Click a reaction to toggle the role' });
  },

  announcementEmbed(title, description, user) {
    return new EmbedBuilder()
      .setColor(0xFEE75C)
      .setTitle(title)
      .setDescription(description)
      .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL() })
      .setTimestamp();
  },
};
