module.exports = {
    name: "stop",
    description: "Stops the queue",
    aliases: [],
    options: [],
    permissions: [],
    isExecVoice: true
}
module.exports.run = async (client, { EmbedBuilder }, message, args, color) => {
    const voiceChannel = message.member.voice.channel;
        if(!voiceChannel){
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setDescription("> You need to be connected to voice channel!")
                        .setColor(color)
                ],
                allowedMentions: { repliedUser: false }
            });
        };
        if(message.guild.members.me.voice.channel && voiceChannel.id != message.guild.members.me.voice.channel.id){
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setDescription("> I\'m already connected to other voice channel!")
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
                        new EmbedBuilder()
                            .setDescription("> There\'s no queue to stop!")
                            .setColor(color)
                    ],
                    allowedMentions: { repliedUser: false }
                });
            };

        await queue.connection.destroy();
        client.queue.delete(message.guild.id);

        message.reply({
            embeds: [
                new EmbedBuilder()
                    .setDescription(`⏹️ ${message.member} stopped the queue`)
                    .setColor(color)
            ],
            allowedMentions: { repliedUser: false }
        });
    } catch (err){
        console.log(err);
        return await message.reply({
            embeds: [
                new EmbedBuilder()
                    .setDescription(`Something went wrong... \n> \`${err}\``)
                    .setColor(color)
            ],
            allowedMentions: { repliedUser: false }
        });
    };
}