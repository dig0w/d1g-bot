module.exports = {
    name: 'lyrics',
    description: 'Gives the lyrics of the song',
    aliases: ['ly'],
    options: [
        {
            name: 'song',
            type: 2,
            required: false
        }
    ],
    permissions: []
}
module.exports.run = async (client, { MessageEmbed }, message, args, color) => {
    const lyricsFinder = require('@sujalgoel/lyrics-finder');

    const song = args.splice(1, args.length).join(' ');

    if(song){
        try{
            lyricsFinder.LyricsFinder(song).then(data => {
                message.reply({
                    embeds: [
                        new MessageEmbed()
                            .setTitle(`${song}`)
                            .setDescription(`${data}`)
                            .setColor(color)
                    ],
                    allowedMentions: { repliedUser: false }
                });
            });
        } catch (err){
            console.log(err);
            return await message.reply({
                embeds: [
                    new MessageEmbed()
                        .setDescription(`Something went wrong... \n> \`${err}\``)
                        .setColor(color)
                ],
                allowedMentions: { repliedUser: false }
            });
        };
    } else{
        const voiceChannel = message.member.voice.channel;
            if(!voiceChannel){
                return message.reply({
                    embeds: [
                        new MessageEmbed()
                            .setDescription(`> You need to be connected to voice channel!`)
                            .setColor(color)
                    ],
                    allowedMentions: { repliedUser: false }
                });
            };
          if(message.guild.me.voice.channel && voiceChannel.id != message.guild.me.voice.channel.id){
                return message.reply({
                    embeds: [
                        new MessageEmbed()
                            .setDescription(`> I\'m already playing music in other voice channel!`)
                            .setColor(color)
                    ],
                    allowedMentions: { repliedUser: false }
                });
          };

        try{
            const queue = client.queue.get(message.guild.id);
                if(!queue){
                    return message.reply({
                        embeds: [
                            new MessageEmbed()
                                .setDescription(`> There\'s no song to get the lyrics!`)
                                .setColor(color)
                        ],
                        allowedMentions: { repliedUser: false }
                    });
                };
            
            const npSong = queue.songs.find(song => song == queue.npSong);

            lyricsFinder.LyricsFinder(npSong.title).then(data => {
                message.reply({
                    embeds: [
                        new MessageEmbed()
                            .setTitle(`${song}`)
                            .setDescription(`${data}`)
                            .setColor(color)
                    ],
                    allowedMentions: { repliedUser: false }
                });
            });
        } catch (err){
            console.log(err);
            return await message.reply({
                embeds: [
                    new MessageEmbed()
                        .setDescription(`Something went wrong... \n> \`${err}\``)
                        .setColor(color)
                ],
                allowedMentions: { repliedUser: false }
            });
        };
    };
}