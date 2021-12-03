module.exports = client => {
    client.on('guildMemberRemove', async member => {
        const { MessageEmbed } = require('discord.js');
        var color = member.guild.me.displayHexColor;
            if(member.guild.me.displayHexColor == '#000000') color = '#AD8EFB';

        const channel = member.guild.channels.cache.get('835934536650588202');

        channel.send({ embeds: [
            new MessageEmbed()
                .setTitle(`😥 ${member.user.tag} Saiu do servidor!`)
                .setDescription(`Espero que volte...`)
                .setFooter(member.guild.name, member.guild.iconURL())
                .setThumbnail(member.user.displayAvatarURL())
                .setColor(color)
        ] })
    });
}