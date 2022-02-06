require('dotenv').config();

const app = require('express')();
app.get('/', (req, res) => {
    const ping = new Date();
    ping.setHours(ping.getHours()-3);
    res.sendStatus(200);
});
app.listen(process.env.PORT);

const Discord = require('discord.js');

const client = new Discord.Client({ intents: [Discord.Intents.FLAGS.GUILDS,Discord.Intents.FLAGS.GUILD_MEMBERS,Discord.Intents.FLAGS.GUILD_BANS,Discord.Intents.FLAGS.GUILD_INVITES,Discord.Intents.FLAGS.GUILD_VOICE_STATES,Discord.Intents.FLAGS.GUILD_PRESENCES,Discord.Intents.FLAGS.GUILD_MESSAGES,Discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS] });

client.queue = new Map();

client.commands = new Discord.Collection();
require('./handler.js')(client);

client.login(process.env.token);