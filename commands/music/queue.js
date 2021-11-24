module.exports = {
    name: 'queue',
    description: 'Resume a song',
    options: [],
    permissions: []
}
module.exports.run = async (client, { MessageEmbed }, message, args, color) => {
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
        const queue = await client.distube.getQueue(voiceChannel);
            if(!queue){
                return message.reply({
                    embeds: [
                        new MessageEmbed()
                            .setDescription(`> There\'s no queue!`)
                            .setColor(color)
                    ],
                    allowedMentions: { repliedUser: false }
                });
            };

        const queueEmbed = new MessageEmbed()
            .setDescription(`**Queue:**\n${queue.songs.map((song, id) => `\n**${id+1}** - [${song.name}](${song.url}) **\`${song.formattedDuration}\`**`)}`)
            .setFooter(`Volume: ${queue.volume}% | Loop: ${queue.repeatMode ? queue.repeatMode === 2 ? 'All Queue' : 'Current Song' : 'Off'} | Autoplay: ${queue.autoplay ? "On" : "Off"} | Filter: ${queue.filters.join(", ") || 'Off'}`)
            .setColor(color);

        if(queueEmbed.description.length >= 2048) queueEmbed.description = `${queueEmbed.description.substr(0, 2045)}...`;

        message.reply({
            embeds: [queueEmbed],
            allowedMentions: { repliedUser: false }
        });
    } catch (err){
        console.log(err);
        return await message.reply({
            embeds: [
                new MessageEmbed()
                    .setDescription(`Something went wrong... \n\`${err}\``)
                    .setColor(color)
            ],
            allowedMentions: { repliedUser: false }
        });
    };
}