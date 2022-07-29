require('dotenv').config();

const app = require('express')();
app.get('/', (req, res) => {
    const ping = new Date();
    ping.setHours(ping.getHours()-3);
    res.sendStatus(200);
});
app.listen(process.env.PORT);

const discord = require('discord.js');

const client = new discord.Client({ intents: [discord.Intents.FLAGS.GUILDS, discord.Intents.FLAGS.GUILD_MEMBERS, discord.Intents.FLAGS.GUILD_BANS, discord.Intents.FLAGS.GUILD_INVITES, discord.Intents.FLAGS.GUILD_VOICE_STATES, discord.Intents.FLAGS.GUILD_PRESENCES, discord.Intents.FLAGS.GUILD_MESSAGES, discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS] });

client.queue = new Map();

client.commands = new discord.Collection();

require('./handler.js')(client);

client.login(process.env.clientToken);