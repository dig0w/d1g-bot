module.exports = client => {
    const { MessageEmbed } = require('discord.js');
    const color = '#AD8EFB';

    client.distube
        .on('playSong', (queue, song) =>
            queue.textChannel.send({ embeds: [
                new MessageEmbed()
                    .setDescription(`▶️ Playing: [${song.name}](${song.url}) **\`${song.formattedDuration}\`**`)
                    .setFooter({ text: `By: ${song.user.tag}` })
                    .setColor(color)
            ]})
        )
        .on('addSong', (queue, song) =>
            queue.textChannel.send({ embeds: [
                new MessageEmbed()
                    .setDescription(`↪️ Queued: [${song.name}](${song.url}) **\`${song.formattedDuration}\`**`)
                    .setFooter({ text: `By: ${song.user.tag}` })
                    .setColor(color)
            ]})
        )
        .on('addList', (queue, playlist) =>
            queue.textChannel.send({ embeds: [
                new MessageEmbed()
                    .setDescription(`↪️ Queued: [${playlist.name}](${playlist.url}) with **\`${playlist.songs.length}\`** songs`)
                    .setFooter({ text: `By: ${song.user.tag}` })
                    .setColor(color)
            ]})
        )
        .on('error', (channel, err) => {
            channel.send({ embeds: [
                new MessageEmbed()
                    .setDescription(`Something went wrong... \n> \`${err}\``)
                    .setColor(color)
            ]});
            console.error(err);
        })
        .on('searchNoResult', (message, query) =>
            message.channel.send({ embeds: [
                new MessageEmbed()
                    .setDescription(`❌ No result found for \`${query}\`!`)
                    .setColor(color)
            ]})
        )
}