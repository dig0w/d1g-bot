module.exports = {
    name: 'skipto',
    description: 'Skip to a song in the queue',
    aliases: [],
    options: [
        {
            name: 'song position',
            type: 3,
            required: true
        }
    ],
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
                            .setDescription(`> There\'s no song to skip!`)
                            .setColor(color)
                    ],
                    allowedMentions: { repliedUser: false }
                });
            };

        const skipto = parseInt(args[1])-1;
        queue.skipto = skipto;

        queue.connection._state.subscription.player.stop();

        message.reply({
            embeds: [
                new MessageEmbed()
                    .setDescription(`⏭️ ${message.member} skipped to [${queue.songs[queue.skipto].title}](${queue.songs[queue.skipto].url})`)
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