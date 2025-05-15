require('dotenv').config();
const { Client, GatewayIntentBits, Partials, EmbedBuilder, PermissionsBitField } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent
    ],
    partials: [Partials.Message, Partials.Channel, Partials.GuildMember]
});

client.once('ready', () => {
    console.log(`🚀 Dev Network Bot is online as ${client.user.tag}`);
});

// Define commands and their permissions
const commands = {
    rules: {
        isAdminOnly: true,
        execute: (message) => {
            const rulesEmbed = new EmbedBuilder()
                .setColor('#5865F2')
                .setTitle('🚀 Dev Network Rules')
                .setDescription("**Welcome to the Dev Network!**\nTo make this community a safe, inclusive, and inspiring space for developers, we follow a strict no-tolerance policy. Please be kind, respectful, and supportive at all times.")
                .addFields(
                    { name: "📝 **Server Rules (Part 1)**", value: "> 🔹 **Be Respectful:** Treat everyone with kindness and respect.\n> 🔹 **No Hate Speech:** Racism, discrimination, homophobia, bullying, or hate speech will result in a permanent ban.\n> 🔹 **Avoid Sensitive Topics:** Discussions about politics or religion are not allowed.\n> 🔹 **No Harassment:** Harassment in any form is strictly prohibited." },
                    { name: "📝 **Server Rules (Part 2)**", value: "> 🔹 **No NSFW Content:** Profanity, NSFW chats, or inappropriate profile names/pictures are not allowed.\n> 🔹 **No Spamming:** Avoid spamming, writing in caps, or sending unnecessary messages.\n> 🔹 **No External Links:** Do not send external links, invites, or spam." },
                    { name: "📝 **Server Rules (Part 3)**", value: "> 🔹 **Ping Mods Wisely:** Only tag mods in emergencies.\n> 🔹 **Respect Privacy:** Do not share personal information about yourself or others." },
                    { name: "🔧 **Why These Rules?**", value: "These rules ensure our community remains a safe, inclusive, and productive space for everyone. By following them, you help create an environment where developers can thrive, collaborate, and innovate together." }
                )
                .setFooter({ text: "Dev Network | Together, We Build the Future 🚀" })
                .setTimestamp();

            message.channel.send({ embeds: [rulesEmbed] });
        }
    },
    announcement: {
        isAdminOnly: true,
        execute: (message) => {
            const announcementEmbed = new EmbedBuilder()
                .setColor('#FFD700')
                .setTitle('🚀 Dev Network: Shaping the Future of Tech Together 🚀')
                .setDescription("Big things are on the horizon! We’re building a next-gen community for developers like you, where innovation, collaboration, and growth are at the core.")
                .addFields(
                    { name: "✨ **What to Expect?**", value: "> 🔧 **Real-Time Collaboration:** Build, share, and refine projects with fellow developers.\n> 🛠️ **Technical Support:** Get guidance from experts.\n> 📚 **Learning Hub:** Access tutorials, guides, and exclusive content.\n> 🎉 **Events & Hackathons:** Participate in coding challenges and win prizes.\n> 🗣️ **Live Discussions:** Engage in deep tech talks." },
                    { name: "🌟 **Why Join the Dev Network?**", value: "> 💡 **Innovate Together:** Be part of a forward-thinking, like-minded community.\n> 🤝 **Supportive Network:** No question is too small, no idea too big.\n> 🏆 **Showcase Your Skills:** Share your projects and get recognized." }
                )
                .setFooter({ text: "Dev Network | Together, We Build the Future 🚀" })
                .setTimestamp();

            message.channel.send({ embeds: [announcementEmbed] });
        }
    },
    ping: {
        isAdminOnly: false,
        execute: (message) => {
            message.reply("Pong! 🏓");
        }
    },
    hello: {
        isAdminOnly: false,
        execute: (message) => {
            message.reply(`Hello, ${message.author.username}! 👋`);
        }
    }
};

client.on('messageCreate', (message) => {
    // Ignore bot messages
    if (message.author.bot) return;
    
    // Extract command
    const command = message.content.slice(1).toLowerCase(); // Remove the "!" and get the command name
    
    // Check if the command exists
    if (commands[command]) {
        const cmd = commands[command];

        // Check for admin-only commands
        if (cmd.isAdminOnly && !message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply("⛔ You do not have permission to use this command.");
        }

        // Execute the command
        cmd.execute(message);
    }
});

// Login to Discord
client.login(process.env.TOKEN);
