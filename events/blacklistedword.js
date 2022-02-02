module.exports = client => {
    client.on('message', async message => {
        if(message.author.bot || message.channel.type === 'dm') return;
    
        const blacklistwords = ['nigga'];
    
        for(var i = 0; i < blacklistwords.length; i++){
            const word = blacklistwords[i];
            
            if(message.content.includes(word)){
                const { MessageEmbed } = require('discord.js');
                var color = message.guild.me.displayHexColor;
                    if(message.guild.me.displayHexColor == '#000000') color = '#AD8EFB';
                const member = message.guild.members.cache.find(member => member.id == message.author.id);
                var reason = 'Sent a blacklisted word';
        
                message.delete();
        
                const channel = message.guild.channels.cache.get('835958004247166998');
        
                channel.send({ embeds: [
                    new MessageEmbed()
                        .setTitle(`⚠ Warn`)
                        .setDescription(`The member ${member.user} has been warned!`)
                        .setFooter(reason)
                        .setThumbnail(member.user.displayAvatarURL())
                        .setColor(color)
                ] });
            };
        };
    });
}