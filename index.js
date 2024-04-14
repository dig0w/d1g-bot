require("dotenv").config();

const app = require("express")();
const port = 8080;
app.get("/", (req, res) => {
    const ping = new Date();
    ping.setHours(ping.getHours()-3);
    res.sendStatus(200);
});
app.listen(process.env.PORT || port, () => console.log(`🟩 App listening on port: ${process.env.PORT || port}`) );

const Discord = require("discord.js");

const client = new Discord.Client({ intents: [Discord.GatewayIntentBits.GuildEmojisAndStickers, Discord.GatewayIntentBits.GuildIntegrations, Discord.GatewayIntentBits.GuildInvites, Discord.GatewayIntentBits.GuildMembers, Discord.GatewayIntentBits.GuildMessageReactions, Discord.GatewayIntentBits.GuildMessageTyping, Discord.GatewayIntentBits.GuildMessages, Discord.GatewayIntentBits.GuildModeration, Discord.GatewayIntentBits.GuildPresences, Discord.GatewayIntentBits.GuildScheduledEvents, Discord.GatewayIntentBits.GuildVoiceStates, Discord.GatewayIntentBits.GuildWebhooks, Discord.GatewayIntentBits.Guilds, Discord.GatewayIntentBits.MessageContent] });

client.queue = new Map();

client.commands = new Discord.Collection();
require("./handler.js")(client);

client.login(process.env.clientToken);