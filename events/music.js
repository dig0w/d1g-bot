module.exports = client => {
    const { MessageEmbed } = require('discord.js');
    const color = '#AD8EFB';
    
    client.distube.on("playSong", (queue, song) =>
            queue.textChannel.send({
                embeds: [
                    new MessageEmbed()
                        .setDescription(`▶️ Now Playing: [${song.name}](${song.url}) **\`${song.formattedDuration}\`**`)
                        .setFooter(`By: ${song.user.tag}`)
                        .setColor(color)
                ]
            })
        );
    client.distube.on("addSong", (queue, song) =>
            queue.textChannel.send({
                embeds: [
                    new MessageEmbed()
                        .setDescription(`↪️ Queued: [${song.name}](${song.url}) **\`${song.formattedDuration}\`**`)
                        .setFooter(`By: ${song.user.tag}`)
                        .setColor(color)
                ]
            })
        );
    client.distube.on("addList", (queue, playlist) => 
            queue.textChannel.send({
                embeds: [
                    new MessageEmbed()
                        .setDescription(`↪️ Queued: [${playlist.name}](${playlist.url}) with **\`${playlist.songs.length}\`** songs`)
                        .setFooter(`By: ${playlist.user.tag}`)
                        .setColor(color)
                ]
            })
        );
    client.distube.on("error", (channel, err) => {
            console.error(err)
            return channel.send({
                embeds: [
                    new MessageEmbed()
                        .setDescription(`Something went wrong... \n\`${err}\``)
                        .setColor(color)
                ]
            });
        });
}