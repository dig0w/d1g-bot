module.exports = client => {
    client.on('messageCreate', message => {
        const Discord = require('discord.js');

        if(!message.content.startsWith(process.env.prefix)) return;

        var args = message.content.substring(process.env.prefix.length).split(' ').filter(arg => arg != '');

        if(!client.commands.has(args[0])) return;

        const command = client.commands.get(args[0]);
        var color = message.guild.me.displayHexColor;
            if(message.guild.me.displayHexColor == '#000000') color = '#AD8EFB';

        command.run(client, Discord, message, args, color);
    });
}