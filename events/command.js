module.exports = client => {
    client.on('messageCreate', message => {
        const Discord = require('discord.js');

        if(!message.content.startsWith(process.env.prefix)) return;

        var args = message.content.substring(process.env.prefix.length).split(' ').filter(arg => arg != '');

        if(!client.commands.has(args[0])) return;

        const command = client.commands.get(args[0]);
        var color = message.guild.me.displayHexColor;
            if(message.guild.me.displayHexColor == '#000000') color = '#AD8EFB';

        // Usage
            var options = '';
            command.options.forEach(option => { if(option.required){ options += `**\`${option.name}\`**`; } else{ options += `\`${option.name}\`` } });

            const usageEmbed = new Discord.MessageEmbed()
                .setDescription(`**Wrong Usage**\n\n> Use: \`${process.env.prefix}${command.name}\`${options}`)
                .setColor(color);

            var member;

            for(var i = 0; i < command.options.length; i++){
                if(command.options[i].required && !args[i+1]) return message.reply({ embeds: [usageEmbed], allowedMentions: { repliedUser: false } });
                if(command.options[i].required && command.options[i].type == 1 && !message.guild.members.cache.find(member => member.id == args[i+1].substring(3, args[i+1].length-1))) return message.reply({ embeds: [usageEmbed], allowedMentions: { repliedUser: false } });
                if(command.options[i].required && command.options[i].type == 3 && isNaN(args[i+1]) || command.options[i].required && command.options[i].type == 3 && parseInt(args[i+1]) < 0) return message.reply({ embeds: [usageEmbed], allowedMentions: { repliedUser: false } });
                if(command.options[i].required && command.options[i].type == 1){ member = message.guild.members.cache.find(member => member.id == args[i+1].substring(3, args[i+1].length-1));};
            };

        // Permissions
            const validPermissions = [
                'CREATE_INSTANT_INVITE',
                'KICK_MEMBERS',
                'BAN_MEMBERS',
                'ADMINISTRATOR',
                'MANAGE_CHANNELS',
                'MANAGE_GUILD',
                'ADD_REACTIONS',
                'VIEW_AUDIT_LOG',
                'PRIORITY_SPEAKER',
                'STREAM',
                'VIEW_CHANNEL',
                'SEND_MESSAGES',
                'SEND_TTS_MESSAGES',
                'MANAGE_MESSAGES',
                'EMBED_LINKS',
                'ATTACH_FILES',
                'READ_MESSAGE_HISTORY',
                'MENTION_EVERYONE',
                'USE_EXTERNAL_EMOJIS',
                'VIEW_GUILD_INSIGHTS',
                'CONNECT',
                'SPEAK',
                'MUTE_MEMBERS',
                'DEAFEN_MEMBERS',
                'MOVE_MEMBERS',
                'USE_VAD',
                'CHANGE_NICKNAME',
                'MANAGE_NICKNAMES',
                'MANAGE_ROLES',
                'MANAGE_WEBHOOKS',
                'MANAGE_EMOJIS',
                'HIGHER_ROLE'
            ];

            for(const permission of command.permissions){
                if(!validPermissions.includes(permission)){
                    throw new Error(`Unknown permission: "${permission}"`);
                };


                if(member && permission == 'HIGHER_ROLE' && message.member.roles.highest.rawPosition < member.roles.highest.rawPosition){
                    return message.reply({
                        embeds: [
                            new Discord.MessageEmbed()
                                .setDescription(`**Missing Permissions**\n\n> The member has a higher or equal role to yours.`)
                                .setColor(color)
                        ],
                        allowedMentions: {
                            repliedUser: false
                        }
                    });
                } else if(permission != 'HIGHER_ROLE' && !message.member.permissions.has(Discord.Permissions.FLAGS[permission])){
                    return message.reply({
                        embeds: [
                            new Discord.MessageEmbed()
                                .setDescription(`**Missing Permissions**\n\n> You don't have the required permissions.\n> **\`${permission}\`**`)
                                .setColor(color)
                        ],
                        allowedMentions: {
                            repliedUser: false
                        }
                    });
                };
            };

        command.run(client, Discord, message, args, color);
    });
}