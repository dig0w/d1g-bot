module.exports = client => {
    client.on('message', async message => {
        if(message.author.bot || message.channel.type === 'dm') return;
    
        if(message.content.includes('discord.gg/')){
            const isOurInvite = await isInvite(message.guild, message.content.split('discord.gg/')[1]);
                if(!isOurInvite){
                    const { MessageEmbed } = require('discord.js');
                    var color = message.guild.me.displayHexColor;
                        if(message.guild.me.displayHexColor == '#000000') color = '#AD8EFB';
                    const member = message.guild.members.cache.find(member => member.id == message.author.id);
                    var reason = 'Sent a server invite';
            
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
    
        async function isInvite(guild, code) {
            return await new Promise((resolve) => {
                guild.invites.fetch().then((invites) => {
                    for(const invite of invites){
                        if (code === invite[0]) return resolve(true);
                    };
                    resolve(false);
                });
            });
        };
    });
}