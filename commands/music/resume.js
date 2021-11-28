module.exports = {
    name: 'resume',
    description: 'Resume a song',
    aliases: [],
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
        const queue = client.queue.get(message.guild.id);
            if(!queue){
                return message.reply({
                    embeds: [
                        new MessageEmbed()
                            .setDescription(`> There\'s no song to resume!`)
                            .setColor(color)
                    ],
                    allowedMentions: { repliedUser: false }
                });
            };

        queue.connection._state.subscription.player.unpause();

        message.reply({
            embeds: [
                new MessageEmbed()
                    .setDescription(`▶️ ${message.member} resumed the song`)
                    .setColor(color)
            ],
            allowedMentions: { repliedUser: false }
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
}