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

module.exports = {
  suggest: {
    isAdminOnly: false,
    async execute(message, args) {
      const suggestion = args.join(" ");
      if (!suggestion) {
        return message.reply(
          "❗ Please provide a suggestion. Example: `!suggest Add a new gaming channel`"
        );
      }

      // Create Embed
      const embed = new EmbedBuilder()
        .setColor("Blue")
        .setTitle("💡 New Suggestion")
        .setDescription(suggestion)
        .addFields([
          {
            name: "How to Use `!suggest`",
            value:
              "Share your ideas and improvements for the server.\n**Example:** `!suggest Add a new gaming channel`",
          },
        ])
        .setFooter({ text: `Suggested by ${message.author.tag}` })
        .setTimestamp();

      // Send the embed to the suggestions channel
      const channel = message.guild.channels.cache.get(
        process.env.SUGGESTION_CHANNEL_ID
      );
      if (!channel) return message.reply("❗ Suggestions channel not found.");

      // Send the embed and delete the original message
      await channel.send({ embeds: [embed] });
      await message.delete();
    },
  },

  report: {
    isAdminOnly: false,
    async execute(message, args) {
      const report = args.join(" ");
      if (!report) {
        return message.reply(
          "❗ Please provide a report. Example: `!report Bot is not responding to commands`"
        );
      }

      // Create Embed
      const embed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("🚨 New Report")
        .setDescription(report)
        .addFields([
          {
            name: "How to Use `!report`",
            value:
              "Report bugs or issues you encounter in the server or bot.\n**Example:** `!report Bot is not responding to commands`",
          },
        ])
        .setFooter({ text: `Reported by ${message.author.tag}` })
        .setTimestamp();

      // Create Resolved Button
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`resolve_${message.id}`)
          .setLabel("Mark as Resolved")
          .setStyle(ButtonStyle.Danger)
      );

      // Send the embed to the reports channel
      const channel = message.guild.channels.cache.get(
        process.env.REPORT_CHANNEL_ID
      );
      if (!channel) return message.reply("❗ Reports channel not found.");

      // Send the embed and delete the original message
      const reportMessage = await channel.send({
        embeds: [embed],
        components: [row],
      });
      await message.delete();

      // Handle button interaction
      const filter = (interaction) =>
        interaction.customId === `resolve_${message.id}` &&
        interaction.member.permissions.has("Administrator");

      const collector = reportMessage.createMessageComponentCollector({
        filter,
        max: 1,
      });

      collector.on("collect", async (interaction) => {
        const resolvedEmbed = EmbedBuilder.from(embed)
          .setColor("Green")
          .addFields([
            { name: "Status", value: `✅ Resolved by ${interaction.user.tag}` },
          ]);

        await interaction.update({
          embeds: [resolvedEmbed],
          components: [],
        });
      });
    },
  },
  rules: {
    isAdminOnly: true,
    execute: (message) => {
      const rulesEmbed = new EmbedBuilder()
        .setColor("#5865F2")
        .setTitle("🚀 Dev Network Rules")
        .setDescription(
          "**Welcome to the Dev Network!**\nTo make this community a safe, inclusive, and inspiring space for developers, we follow a strict no-tolerance policy. Please be kind, respectful, and supportive at all times."
        )
        .addFields(
          {
            name: "📝 **Server Rules (Part 1)**",
            value:
              "> 🔹 **Be Respectful:** Treat everyone with kindness and respect.\n> 🔹 **No Hate Speech:** Racism, discrimination, homophobia, bullying, or hate speech will result in a permanent ban.\n> 🔹 **Avoid Sensitive Topics:** Discussions about politics or religion are not allowed.\n> 🔹 **No Harassment:** Harassment in any form is strictly prohibited.",
          },
          {
            name: "📝 **Server Rules (Part 2)**",
            value:
              "> 🔹 **No NSFW Content:** Profanity, NSFW chats, or inappropriate profile names/pictures are not allowed.\n> 🔹 **No Spamming:** Avoid spamming, writing in caps, or sending unnecessary messages.\n> 🔹 **No External Links:** Do not send external links, invites, or spam.",
          },
          {
            name: "📝 **Server Rules (Part 3)**",
            value:
              "> 🔹 **Ping Mods Wisely:** Only tag mods in emergencies.\n> 🔹 **Respect Privacy:** Do not share personal information about yourself or others.",
          },
          {
            name: "🔧 **Why These Rules?**",
            value:
              "These rules ensure our community remains a safe, inclusive, and productive space for everyone. By following them, you help create an environment where developers can thrive, collaborate, and innovate together.",
          }
        )
        .setFooter({ text: "Dev Network | Together, We Build the Future 🚀" })
        .setTimestamp();

      message.channel.send({ embeds: [rulesEmbed] });
    },
  },
  announcement: {
    isAdminOnly: true,
    execute: (message) => {
      const announcementEmbed = new EmbedBuilder()
        .setColor("#FFD700")
        .setTitle("🚀 Dev Network: Shaping the Future of Tech Together 🚀")
        .setDescription(
          "Big things are on the horizon! We’re building a next-gen community for developers like you, where innovation, collaboration, and growth are at the core."
        )
        .addFields(
          {
            name: "✨ **What to Expect?**",
            value:
              "> 🔧 **Real-Time Collaboration:** Build, share, and refine projects with fellow developers.\n> 🛠️ **Technical Support:** Get guidance from experts.\n> 📚 **Learning Hub:** Access tutorials, guides, and exclusive content.\n> 🎉 **Events & Hackathons:** Participate in coding challenges and win prizes.\n> 🗣️ **Live Discussions:** Engage in deep tech talks.",
          },
          {
            name: "🌟 **Why Join the Dev Network?**",
            value:
              "> 💡 **Innovate Together:** Be part of a forward-thinking, like-minded community.\n> 🤝 **Supportive Network:** No question is too small, no idea too big.\n> 🏆 **Showcase Your Skills:** Share your projects and get recognized.",
          }
        )
        .setFooter({ text: "Dev Network | Together, We Build the Future 🚀" })
        .setTimestamp();

      message.channel.send({ embeds: [announcementEmbed] });
    },
  },
  profile: {
    isAdminOnly: false,
    execute: async (message) => {
      const args = message.content.split(" ");
      const username = args[1];

      if (!username) {
        return message.reply(
          "⚠️ Please provide a GitHub username. Usage: `!profile <GitHub Username>`"
        );
      }

      try {
        const response = await axios.get(
          `https://api.github.com/users/${username}`
        );
        const {
          login,
          name,
          bio,
          public_repos,
          followers,
          following,
          avatar_url,
          html_url,
        } = response.data;

        const profileEmbed = new EmbedBuilder()
          .setColor("#4078c0")
          .setTitle(`${name || login}'s GitHub Profile`)
          .setURL(html_url)
          .setThumbnail(avatar_url)
          .addFields(
            { name: "📝 **Username**", value: login, inline: true },
            {
              name: "📝 **Name**",
              value: name || "Not Available",
              inline: true,
            },
            { name: "📝 **Bio**", value: bio || "No bio available" },
            {
              name: "📂 **Public Repositories**",
              value: public_repos.toString(),
              inline: true,
            },
            {
              name: "👥 **Followers**",
              value: followers.toString(),
              inline: true,
            },
            {
              name: "👥 **Following**",
              value: following.toString(),
              inline: true,
            }
          )
          .setFooter({ text: "Dev Network | Together, We Build the Future 🚀" })
          .setTimestamp();

        message.channel.send({ embeds: [profileEmbed] });
      } catch (error) {
        console.error(error);
        message.reply(
          "❌ Could not fetch the GitHub profile. Please check the username or try again later."
        );
      }
    },
  },
  repos: {
    isAdminOnly: false,
    execute: async (message, args) => {
      if (!args[0])
        return message.reply(
          "❌ Please provide a GitHub username, like `!repos Harshit-Maurya838`."
        );
      const username = args[0];
      try {
        const { data } = await axios.get(
          `https://api.github.com/users/${username}/repos?per_page=10&sort=updated`
        );
        const repoList = data
          .map(
            (repo) =>
              `🔹 **[${repo.name}](${repo.html_url})**\n${
                repo.description || "No description available"
              }\n⭐ ${repo.stargazers_count} | 🍴 ${repo.forks_count}\n`
          )
          .join("\n");
        const reposEmbed = new EmbedBuilder()
          .setColor("#36a64f")
          .setTitle(`${username}'s Repositories (Showing 10 most recent)`)
          .setDescription(repoList || "No repositories found.")
          .setFooter({
            text: `View all repositories: https://github.com/${username}?tab=repositories`,
          })
          .setTimestamp();
        message.channel.send({ embeds: [reposEmbed] });
      } catch (error) {
        console.error(error);
        message.reply(
          "❌ Unable to fetch the repositories. Make sure the username is correct and try again."
        );
      }
    },
  },
  code: {
    isAdminOnly: false,
    execute: (message, args) => {
      const [lang, ...codeParts] = args;
      const codeContent = codeParts.join(" ").trim();
      if (!lang || !codeContent) {
        return message.reply(
          "❌ Please provide a language and some code to share, like `!code js console.log('Hello, World!');`"
        );
      }

      // Delete the original command message
      message.delete();

      // Send the copy code button and hidden code
      const codeEmbed = new EmbedBuilder()
        .setColor("#2f3136")
        .setTitle("💻 Shared Code")
        .setDescription(`**Code shared by ${message.author.username}**`)
        .setFooter({ text: "Dev Network | Code Sharing" })
        .setTimestamp();

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("copy_code")
          .setLabel("📋 Copy Code")
          .setStyle(ButtonStyle.Secondary)
      );

      message.channel.send({ embeds: [codeEmbed], components: [row] });

      // Handle button interaction
      client.on("interactionCreate", async (interaction) => {
        if (!interaction.isButton() || interaction.customId !== "copy_code")
          return;
        await interaction.reply({
          content: `\`\`\`${lang}\n${codeContent}\n\`\`\``,
          ephemeral: true,
        });
      });
    },
  },
  roles: {
    isAdminOnly: true,
    execute: (message) => {
      const rolesEmbed = new EmbedBuilder()
        .setColor("#00AAFF")
        .setTitle("🛠️ Select Your Role")
        .setDescription(
          "Choose your role from the buttons below. Click again to remove the role."
        )
        .setFooter({ text: "Dev Network | Choose Your Role" })
        .setTimestamp();

      const row1 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("fullstack_dev")
          .setLabel("Full Stack Developer")
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId("game_dev")
          .setLabel("Game Developer")
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId("app_dev")
          .setLabel("App Developer")
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId("api_dev")
          .setLabel("API Developer")
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId("web_dev")
          .setLabel("Web Developer")
          .setStyle(ButtonStyle.Primary)
      );

      const row2 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("ai_ml_dev")
          .setLabel("AI/ML Developer")
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId("dev")
          .setLabel("Developer")
          .setStyle(ButtonStyle.Secondary)
      );

      message.channel.send({ embeds: [rolesEmbed], components: [row1, row2] });
    },
  },
  ping: {
    isAdminOnly: false,
    execute: (message) => {
      message.reply("Pong! 🏓");
    },
  },
  hello: {
    isAdminOnly: false,
    execute: (message) => {
      message.reply(`Hello, ${message.author.username}! 👋`);
    },
  },
  help: {
    isAdminOnly: false,
    execute: (message) => {
      const helpEmbed = new EmbedBuilder()
        .setColor("#00AAFF")
        .setTitle("💡 Dev Network Bot - Help")
        .setDescription("Here are the commands you can use:")
        .addFields(
          {
            name: "🔹 **!code <language> <code>**",
            value:
              "Share code snippets. Example: `!code js console.log('Hello, World!');`",
          },
          {
            name: "🔹 **!profile <GitHub Username>**",
            value: "Fetches GitHub profile information.",
          },
          {
            name: "🔹 **!repos <GitHub Username>**",
            value: "Displays recent repositories of a GitHub user.",
          },
          {
            name: "🔹 **!ping**",
            value: "Responds with 'Pong!' to check bot responsiveness.",
          },
          {
            name: "🔹 **!hello**",
            value: "Greets the user with a friendly message.",
          },
          { name: "🔹 **!help**", value: "Displays this help message." },
          {
            name: "🔹 **!suggest <message>**",
            value: "Share your server improvement suggestions.",
          },
          {
            name: "🔹 **!report <issue>**",
            value: "Report a problem with the server or bot.",
          }
        )
        .setFooter({ text: "Dev Network | Together, We Build the Future 🚀" })
        .setTimestamp();

      message.channel.send({ embeds: [helpEmbed] });
    },
  },
};
