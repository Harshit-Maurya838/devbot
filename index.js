require("dotenv").config();
const {
  Client,
  GatewayIntentBits,
  Partials,
  EmbedBuilder,
  PermissionsBitField,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const axios = require("axios");
const commands = require("./commands/messageCreate.js")

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.GuildMember],
});

client.once("ready", () => {
  console.log(`🚀 Dev Network Bot is online as ${client.user.tag}`);
});

// Message event
client.on("messageCreate", (message) => {
  // Ignore bot messages and messages without prefix
  if (message.author.bot || !message.content.startsWith("!")) return;

  // Extract command
  const [commandName, ...args] = message.content.slice(1).split(/\s+/);
  const command = commands[commandName.toLowerCase()];

  // Check if the command exists
  if (command) {
    if (
      command.isAdminOnly &&
      !message.member.permissions.has(PermissionsBitField.Flags.Administrator)
    ) {
      return message.reply("⛔ You do not have permission to use this command.");
    }

    try {
      command.execute(message, args);
    } catch (error) {
      console.error(`❌ Error executing command: ${commandName}`, error);
      message.reply("🚫 An error occurred while executing this command.");
    }
  } else {
    message.reply("❓ Unknown command. Use `!help` to see the available commands.");
  }
});

// Role assignment via button interactions
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isButton()) return;

  const roleId = {
    fullstack_dev: process.env.fullstack_dev,
    game_dev: process.env.game_dev,
    app_dev: process.env.app_dev,
    api_dev: process.env.api_dev,
    web_dev: process.env.web_dev,
    ai_ml_dev: process.env.ai_ml_dev,
    dev: process.env.dev,
  }[interaction.customId];

  if (roleId) {
    const member = interaction.member;

    try {
      if (member.roles.cache.has(roleId)) {
        await member.roles.remove(roleId);
        await interaction.reply({
          content: `🗑️ Removed your role.`,
          ephemeral: true,
        });
        console.log(`🗑️ Removed role ${roleId} from ${member.user.tag}`);
      } else {
        await member.roles.add(roleId);
        await interaction.reply({
          content: `✅ Role assigned successfully!`,
          ephemeral: true,
        });
        console.log(`✅ Assigned role ${roleId} to ${member.user.tag}`);
      }
    } catch (error) {
      console.error(`❌ Failed to assign role: ${roleId}`, error);
      await interaction.reply({
        content: `🚫 Failed to assign role. Please try again later.`,
        ephemeral: true,
      });
    }
  }

  // Handle Suggest and Report Resolved Button
    if (interaction.customId.startsWith('resolve_')) {
      try {
        const message = interaction.message;
        const adminId = interaction.user.id;

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
          return interaction.reply({
            content: "⛔ Only admins can resolve this.",
            ephemeral: true,
          });
        }

        const resolvedBy = `<@${adminId}>`;

        const resolvedEmbed = EmbedBuilder.from(message.embeds[0])
          .setColor("#2ECC71")
          .setFooter({ text: `Resolved by ${resolvedBy}` });

        await message.edit({
          embeds: [resolvedEmbed],
          components: [],
        });

        await interaction.reply({
          content: `✅ Marked as resolved by ${resolvedBy}.`,
          ephemeral: true,
        });
      } catch (error) {
        console.error("❌ Error in resolve button handler:", error);
        await interaction.reply({
          content: "🚫 Failed to resolve the message. Please try again later.",
          ephemeral: true,
        });
      }
    }
});

// Login to Discord
client.login(process.env.TOKEN);
