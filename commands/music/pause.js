module.exports = {
    name: "pause",
    description: "Pause a song",
    aliases: [],
    options: [],
    permissions: []
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
                        .setDescription("> I\'m already playing music in other voice channel!")
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
                            .setDescription("> There\'s no song to pause!")
                            .setColor(color)
                    ],
                    allowedMentions: { repliedUser: false }
                });
            };

        queue.connection._state.subscription.player.pause();

        message.reply({
            embeds: [
                new EmbedBuilder()
                    .setDescription(`⏸️ ${message.member} paused the song`)
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